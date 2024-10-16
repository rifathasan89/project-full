const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const stripe = require('stripe')(process.env.PAYMENT_SECRET);
const cors = require('cors');
const { default: axios } = require('axios');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
// Routes
// SET TOKEN .
const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'Unauthorize access' })
    }
    const token = authorization?.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ error: true, message: 'forbidden user or token has expired' })
        }
        req.decoded = decoded;
        next()
    })
}

// MONGO DB ROUTES

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3avmb3u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {    
        // Connect the client to the server	(optional starting in v4.7)
        const database = client.db("workout-master");
        const userCollection = database.collection("users");
        const PackagesCollection = database.collection("Packages");
        const cartCollection = database.collection("cart");
        const enrolledCollection = database.collection("enrolled");
        const paymentCollection = database.collection("payments");
        const appliedCollection = database.collection("applied");
        const taskCollection = database.collection("studenttask");
        client.connect();

        // Verify admin
        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            console.log(email)
            const query = { email: email };
            const user = await userCollection.findOne(query);
            if (user.role === 'admin') {
                next()
            }
            else {
                return res.status(401).send({ error: true, message: 'Unauthorize access' })
            }
        }

        const verifyInstructor = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            if (user.role === 'instructor' || user.role === 'admin') {
                next()
            }
            else {
                return res.status(401).send({ error: true, message: 'Unauthorize access' })
            }
        }


        app.post('/new-user', async (req, res) => {
            const newUser = req.body;

            const result = await userCollection.insertOne(newUser);
            res.send(result);
        })
        app.post('/api/set-token', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' })
            res.send({ token })
        })


        // GET ALL USERS
        app.get('/users', async (req, res) => {
            const users = await userCollection.find({}).toArray();
            res.send(users);
        })
        // GET USER BY ID
        app.get('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const user = await userCollection.findOne(query);
            res.send(user);
        })
        // GET USER BY EMAIL
        app.get('/user/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await userCollection.findOne(query);
            res.send(result);
        })
        // Delete a user

        app.delete('/deleteuser/:id',  async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })
        // UPDATE USER
        app.put('/update-user/:id', async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.option,
                    address: updatedUser.address,
                    phone: updatedUser.phone,
                    about: updatedUser.about,
                    photoUrl: updatedUser.photoUrl,
                    skills: updatedUser.skills ? updatedUser.skills : null,
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })


        // ! PACKAGES ROUTES


        app.post('/addpackage',verifyJWT, async (req, res) => {
            const newPackage = req.body;
            // console.log(newPackage);
            newPackage.availableSeats = parseInt(newPackage.availableSeats);
            newPackage.price=parseInt(newPackage.price);
            const result = await PackagesCollection.insertOne(newPackage);
            res.send(result);
        });

      
        app.get('/Packages/:email', verifyJWT, verifyInstructor, async (req, res) => {
            const email = req.params.email;
            const query = { instructorEmail: email };
            const result = await PackagesCollection.find(query).toArray();
            res.send(result);
        })

        
app.get('/singlepackage/:id', async (req, res) => {
    const { id } = req.params;  // Get the ID from the request parameters

    try {
        // Ensure the ID is a valid MongoDB ObjectId
        const package = await PackagesCollection.findOne({ _id: new ObjectId(id) });

        if (!package) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Send the package data back to the client
        res.status(200).json(package);
    } catch (error) {
        console.error('Error fetching package data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

        // GET ALL PACKAGES
        app.get('/Packages', async (req, res) => {
            const query = { status: 'approved' };
            const result = await PackagesCollection.find(query).toArray();
            res.send(result);
        })
        app.get('/Packages-manage', async (req, res) => {
            const result = await PackagesCollection.find().toArray();
            res.send(result);
        })

        // Change status of a package
        app.put('/change-status/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const status = req.body.status;
            console.log(req.body)
            const reason = req.body.reason;
            const filter = { _id: new ObjectId(id) };
            console.log("🚀 ~ file: index.js:180 ~ app.put ~ reason:", reason)
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: status,
                    reason: reason
                }
            }
            const result = await PackagesCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })
        // * GET APPROVED PACKAGES
        app.get('/approved-Packages', async (req, res) => {
            const query = { status: 'approved' };
            const result = await PackagesCollection.find(query).toArray();
            res.send(result);
        })

        // GET ALL INSTRUCTORS
        app.get('/instructors', async (req, res) => {
            const query = { role: 'instructor' };
            const result = await userCollection.find(query).toArray();
            res.send(result);
        })

        app.put('/update-package-admin/:id', verifyJWT, async (req, res) => {
            try {
                const id = req.params.id;
                const updatedPackage = req.body;
                const filter = { _id: new ObjectId(id) };
                
                // Prepare the fields to update
                const updateDoc = {
                    $set: {
                        name: updatedPackage.name,
                        description: updatedPackage.description,
                        price: parseFloat(updatedPackage.price),
                        availableSeats: parseInt(updatedPackage.availableSeats),
                        videoLink: updatedPackage.videoLink,
                        finishedDate:updatedPackage.finishedDate,
                        status: "approved"
                    }
                };
        
                // If a new image is provided, include it in the update
                if (updatedPackage.image) {
                    updateDoc.$set.image = updatedPackage.image;
                }
        
                // Perform the update
                const result = await PackagesCollection.updateOne(filter, updateDoc);
        
                // Send success response
                if (result.modifiedCount > 0) {
                    res.status(200).send({ success: true, message: 'Package updated successfully', result });
                } else {
                    res.status(404).send({ success: false, message: 'Package not found or no changes made' });
                }
            } catch (error) {
                console.error('Error updating package:', error);
                res.status(500).send({ success: false, message: 'Failed to update package', error });
            }
        });
        

        // Update a Packages
        app.put('/update-Package/:id', verifyJWT, verifyInstructor, async (req, res) => {
            const id = req.params.id;
            const updatedPackage = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updatedPackage.name,
                    description: updatedPackage.description,
                    
                    price: updatedPackage.price,
                    availableSeats: parseInt(updatedPackage.availableSeats),
                    videoLink: updatedPackage.videoLink,
                    finishedDate: updatedPackage.finishedDate,
                    status: 'pending'
                }
            }
            const result = await PackagesCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        

        // Get single Package by id for details page
        app.get('/Package/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await PackagesCollection.findOne(query);
            res.send(result);
        })
        // ! CART ROUTES

        // ADD TO CART
        app.post('/add-to-cart', verifyJWT, async (req, res) => {
            const newCartItem = req.body;
            const result = await cartCollection.insertOne(newCartItem);
            res.send(result);
        })
        // Get cart item id for checking if a class is already in cart
        app.get('/cart-item/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const email = req.query.email;
            const query = { PackageId: id, userMail: email };
            const projection = { PackageId: 1 };
            const result = await cartCollection.findOne(query, { projection: projection });
            res.send(result);
        })

        app.get('/usercart',async(req,res)=>{
            // console.log(req.headers.authorization);
            const decoded=req.decoded;
            // if(decoded.email !==req.query.email){
            //   return res.status(403).send({error:1,message:"forbidden access"})
            // }
            // console.log("came back",decoded);
              let query={};
              if(req.query?.email){
                query={userMail: req.query.email}
              }
              const result=await cartCollection.find(query).toArray();
              res.send(result);
          })

          app.get('/api/studenttask', async (req, res) => {
            const { email } = req.query; // Get the email from query parameters

            if (!email) {
                return res.status(400).json({ error: 'Email query parameter is required' });
            }

            try {
                // Find tasks for the given email
                const tasks = await taskCollection.find({ email }).toArray();

                if (tasks.length === 0) {
                    return res.status(404).json({ message: 'No tasks found for this user' });
                }

                return res.status(200).json(tasks);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                return res.status(500).json({ error: 'An error occurred while fetching tasks' });
            }
        });

        app.get('/api/giventask', async (req, res) => {
            const { studentEmail, instructorEmail } = req.query; // Get the student and instructor email from query parameters
        
            if (!studentEmail || !instructorEmail) {
                return res.status(400).json({ error: 'Both studentEmail and instructorEmail query parameters are required' });
            }
        
            try {
                // Find tasks for the given student and instructor
                const tasks = await taskCollection.find({
                    email: studentEmail,
                    instructoremail: instructorEmail
                }).toArray();
        
                if (tasks.length === 0) {
                    return res.status(404).json({ message: 'No tasks found for this user with the given instructor' });
                }
        
                return res.status(200).json(tasks);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                return res.status(500).json({ error: 'An error occurred while fetching tasks' });
            }
        });
        


        app.delete('/delete-cart-item/:id', async(req,res)=>{

            const id=req.params.id;
            const query={_id:new ObjectId(id) };
            const result=await cartCollection.deleteOne(query);
            res.send(result)
   
       });
   
        app.post('/create-payment',async(req,res)=>{
            const trid=new ObjectId().toString();
            const paymentinfo=req.body
            // console.log(paymentinfo);
            const data = {
              store_id:"atten66f2d7b8551b1",
              store_passwd:"atten66f2d7b8551b1@ssl",
              total_amount: paymentinfo.price,
              currency: 'BDT',
              tran_id: trid,
              success_url: `http://localhost:5000/success-payment/${trid}`,
              fail_url: 'http://localhost:3030/fail',
              cancel_url: 'http://localhost:3030/cancel',
              ipn_url: 'http://localhost:3030/ipn',
              shipping_method: 'Courier',
              product_name: 'Hall Booking',
              product_category: 'Service',
              product_profile: 'general',
              cus_name: 'Customer Name',
              cus_email: 'customer@example.com',
              cus_add1: 'Dhaka',
              cus_add2: 'Dhaka',
              cus_city: 'Dhaka',
              cus_state: 'Dhaka',
              cus_postcode: '1000',
              cus_country: 'Bangladesh',
              cus_phone: '01711111111',
              cus_fax: '01711111111',
              shipping_method:"NO",
              multi_card_name:"mastercard,visacard,amexcard",
             
          };
      
          const response=await axios({
            method:"POST",
            url: "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
            data: data,
            headers:{
              "Content-Type":"application/x-www-form-urlencoded",
            }
      
          })
         
       
            res.send({
              paymentUrl: response.data.GatewayPageURL
            });
            const paymentWithTranId = {
                transactionid: trid,
                ...paymentinfo
              };

            if(response){
                const result=await paymentCollection.insertOne(paymentWithTranId);
            }

//             
      
          })

      
    app.post('/success-payment/:trid',async(req,res)=>{
            const payment=req.body;
            const trid=req.params.trid;
            // console.log(payment);
            if(payment.status==="VALID"){
             const paymentData = await paymentCollection.findOne({ transactionid: trid });
             if (paymentData) {
                // Update the orderstatus field in the found payment document
                const updateResult = await paymentCollection.updateOne(
                    { transactionid: trid }, // Filter by transaction ID
                    { $set: { orderstatus: 'Payment successful' } } // Update the orderstatus field
                );

                if (updateResult.modifiedCount > 0) {
                    console.log("status updated")
                    
                } }
                                // const result=await paymentCollection.insertOne(paymentData);
                                const enrolledResult = await enrolledCollection.insertOne(paymentData);
                                const Packagesquery = { _id: { $in: paymentData.PackagesId.map(id => new ObjectId(id)) } };
                                // console.log(Packagesquery);
                   try {
                    // Fetch the packages from the database
                    const packages = await PackagesCollection.find(Packagesquery).toArray();
                    // console.log(packages);
                    if (packages.length > 0) {
                        // Loop through each package and update its totalEnrolled and availableSeats
                        for (const pkg of packages) {
                            // Debug: Log the availableSeats before updating
                            // console.log(`Package ID: ${pkg._id}, availableSeats before update: ${pkg.availableSeats}`);
                
                            // Ensure availableSeats is a number
                            const availableSeats = Number(pkg.availableSeats || 0);
                            const newAvailableSeats = availableSeats - 1; 
                
                            // if (newAvailableSeats < 0) {
                            //     console.log(`Package with ID ${pkg._id} has no available seats.`);
                            //     continue; 
                            // }
                
                            const newTotalEnrolled = (pkg.totalEnrolled || 0) + 1; 
                
                           
                            console.log(`Package ID: ${pkg._id}, newTotalEnrolled: ${newTotalEnrolled}, newAvailableSeats: ${newAvailableSeats}`);
                
                            const updatedDoc = {
                                $set: {
                                    totalEnrolled: newTotalEnrolled,
                                    availableSeats: newAvailableSeats,
                                },
                            };
                
                           
                            const updatedResult = await PackagesCollection.updateOne(
                                { _id: pkg._id },
                                updatedDoc,
                                { upsert: true }
                            );
                
                            console.log(`Updated package with ID: ${pkg._id}`, updatedResult);
                        }
                    } else {
                        // console.log('No packages found for the given IDs.');
                    }
                } catch (error) {
                    console.error('Error updating packages:', error);
                }
                
                                const query={_id: {$in: paymentData.selectedPackagesId.map(id=>new ObjectId(id))}}
                                const deleteResult=await cartCollection.deleteMany(query);
                              
                
            //  console.log(paymentData);
              res.send("payment successful")
            }
          })
      
        // POST PAYMENT INFO 


    app.get('/singlepayment/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };

    const options = {
        projection: {
            transactionid: 1,
            userEmail: 1,
            userName: 1,
            price: 1,
            quantity: 1,
            selectedPackagesId: 1,
            PackagesId: 1,
            PackagesNames: 1,
            InstructorsNames: 1,
        },
    };

    try {
        const result = await paymentCollection.findOne(query, options);
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: 'Payment not found' });
        }
    } catch (error) {
        res.status(500).send({ error: 'Failed to retrieve payment details' });
    }
});

app.get('/allpayments', async (req, res) => {
    try {
      // const decoded=req.decoded;
      // if(decoded.email !==req.query.email){
      //   return res.status(403).send({error:1,message:"forbidden access"})
      // }
      const payments = await paymentCollection.find().toArray();
      // console.log(payments);
      res.send(payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).send({ error: true, message: 'Internal server error' });
    }
  });



        app.get('/payment-history/:email', async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email };
            const result = await paymentCollection.find(query).sort({ date: -1 }).toArray();
            res.send(result);
        })


        app.get('/payment-history-length/:email', async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email };
            const total = await paymentCollection.countDocuments(query);
            res.send({ total });
        })


        // ! ENROLLED ROUTES
        app.get('/myenrolled/:email', async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email };
            const result = await enrolledCollection.find(query).toArray();
            res.send(result);
        })
        /*
        
        app.get('/popular-Packages', async (req, res) => {
            const result = await PackagesCollection.find().sort({ totalEnrolled: -1 }).limit(6).toArray();
            res.send(result);
        })
          */

        app.post('/api/studenttask', async (req, res) => {
            try {
                // Insert the whole request body directly into the collection
                const result = await taskCollection.insertOne(req.body);
                return res.status(201).json({ message: 'Task created successfully', taskId: result.insertedId });
            } catch (error) {
                console.error('Error inserting document:', error);
                return res.status(500).json({ error: 'An error occurred while creating the task' });
            }
        });


        app.get('/get-enrolled-students/:packageId', async (req, res) => {
            const packageId = req.params.packageId;
        
            try {
                // Convert the packageId to a string if it's not already
                const packageIdStr = packageId.toString();
        
                // Find users where 'selectedPackagesId' includes the provided packageId
                const enrolledStudents = await enrolledCollection.find({
                    PackagesId: packageIdStr // packageId should be a string matching an element in the array
                }).toArray();
        
                if (enrolledStudents.length === 0) {
                    return res.status(404).json({ message: 'No students found for this package' });
                }
        
                // Return the list of students
                res.status(200).json(enrolledStudents);
            } catch (error) {
                console.error('Error fetching enrolled students:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
        

        app.delete('/api/studenttask/:id',  async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) };
            const result = await taskCollection.deleteOne(query);
            res.send(result);
        })

        app.get('/popular-Packages',  async (req, res) => {
            try {
              const result = await PackagesCollection.find().sort({ totalEnrolled: -1 }).limit(6).toArray();
              res.send(result);
            } catch (error) {
              console.error(error);
              res.status(500).send({ error: 'Failed to fetch popular packages' });
            }
          });  


        app.get('/popular-instructors', async (req, res) => {
            const pipeline = [
                {
                    $group: {
                        _id: "$instructorEmail",
                        totalEnrolled: { $sum: "$totalEnrolled" },
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "email",
                        as: "instructor"
                    }
                },
                {
                    $project: {
                        _id: 0,
                        instructor: {
                            $arrayElemAt: ["$instructor", 0]
                        },
                        totalEnrolled: 1
                    }
                },
                {
                    $sort: {
                        totalEnrolled: -1
                    }
                },
                {
                    $limit: 6
                }
            ]
            const result = await PackagesCollection.aggregate(pipeline).toArray();
            res.send(result);

        })

        // Admins stats 
        app.get('/admin-stats', verifyJWT, verifyAdmin, async (req, res) => {
            // Get approved classes and pending classes and instructors 
            const approvedPackages = (await PackagesCollection.find({ status: 'approved' }).toArray()).length;
            const pendingPackages = (await PackagesCollection.find({ status: 'pending' }).toArray()).length;
            const instructors = (await userCollection.find({ role: 'instructor' }).toArray()).length;
            const totalPackages = (await PackagesCollection.find().toArray()).length;
            const totalEnrolled = (await enrolledCollection.find().toArray()).length;
            // const totalRevenue = await paymentCollection.find().toArray();
            // const totalRevenueAmount = totalRevenue.reduce((total, current) => total + parseInt(current.price), 0);
            const result = {
                approvedPackages,
                pendingPackages,
                instructors,
                totalPackages,
                totalEnrolled,
                // totalRevenueAmount
            }
            res.send(result);

        })

        // !GET ALL INSTrUCTOR  

        app.get('/instructors', async (req, res) => {
            const result = await userCollection.find({ role: 'instructor' }).toArray();
            res.send(result);
        })




        app.get('/enrolled-Packages/:email', async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email };
                const pipeline = [
                {
                    $match: query
                },
                {
                    $lookup: {
                        from: "Packages",
                        localField: "PackagesId",
                        foreignField: "_id",
                        as: "Packages"
                    }
                },
                {
                    $unwind: "$Packages"
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "Packages.instructorEmail",
                        foreignField: "email",
                        as: "instructor"
                    }
                },
                {
                    $project: {
                        _id: 0,
                        Packages: 1,
                        instructor: {
                            $arrayElemAt: ["$instructor", 0]
                        }
                    }
                }

            ]
            const result = await enrolledCollection.aggregate(pipeline).toArray();
            // const result = await enrolledCollection.find(query).toArray();
            res.send(result);
        })

        // Applied route 
        app.post('/as-instructor', async (req, res) => {
            const data = req.body;
            const result = await appliedCollection.insertOne(data);
            res.send(result);
        })
        app.get('/applied-instructors/:email',   async (req, res) => {
            const email = req.params.email;
            const result = await appliedCollection.findOne({email});
            res.send(result);
        });
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('workout Master Server is running!');
})


// Listen
app.listen(port, () => {
    console.log(`SERVER IS RUNNING ON PORT ${port}`);
})

