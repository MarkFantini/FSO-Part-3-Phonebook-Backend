const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const dbName = 'phonebookApp'

const url = `mongodb+srv://marceloasfantini:${password}@cluster0.c2uvb.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length < 4) {
    console.log('phonebook:')
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person.name, person.number)
        })
        mongoose.connection.close()
        process.exit(0)
    })
} else {
    const personName = process.argv[3]
    console.log('Name: ', personName)

    const personNumber = process.argv[4]
    console.log('Number: ', personNumber)

    const person = new Person({
        name: personName,
        number: personNumber,
    })


    person.save().then(result => {
        console.log(personName, 'added')
        mongoose.connection.close()
    })
}