const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('Connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log('Connected to MongoDB')
  })
  .catch(error => {
    console.log('Error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
    name: {
      type: String,
      minLength: 3,
      required: true
    },
    number: {
      type: String,
      validate: {
        validator: function(v) {
          const parts = v.split('-')

          if (parts.length !== 2) return false

          const[firstPart, secondPart] = parts
          return (
            /^\d{2,3}$/.test(firstPart) &&
            /^\d+/.test(secondPart) &&
            (firstPart.length + secondPart.length) >= 8
          )
        },
        message: props => `${props.value} is not a valid phone number`
      },
      required: [true, 'Phone number required']
    },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)