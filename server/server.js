const mongoose = require("mongoose");
const Document = require("./Document")

//database 1
const connectDatabase = async () => {
  try {
   
    await mongoose.connect("mongodb+srv://MostafaShams:Team13@cluster0.eylrczy.mongodb.net/?retryWrites=true&w=majority", {  //MmNWV3ntpgY8eJU4
      useNewUrlParser:true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    console.log("connected to database");
  } catch (error) {
    console.log(error);
  }
};

connectDatabase();


const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials:true,
  },
})

const defaultValue = ""

io.on("connection", socket => {
  socket.on("get-document", async documentId => {
    const document = await findOrCreateDocument(documentId)
    socket.join(documentId)
    socket.emit("load-document", document.data)

    socket.on("send-changes", delta => {
      socket.broadcast.to(documentId).emit("receive-changes", delta)
    })

    socket.on("save-document", async data => {
      await Document.findByIdAndUpdate(documentId, { data })
    })


    socket.on("getusers", async(documentId) => {
    const num = (await io.in(documentId).fetchSockets()).length
    console.log("num is: "+ num)
    socket.emit("numberOfClients", num)
  })
    
  })
})



async function findOrCreateDocument(id) {
  if (id == null) return

  const document = await Document.findById(id)
  if (document) return document
  return await Document.create({ _id: id, data: defaultValue })
}
