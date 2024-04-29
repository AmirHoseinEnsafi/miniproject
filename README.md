# Library  

## Installation  

You need to install the npm packages in terminal using:  

    - `npm i`  

For running the project, using the code please write the node server and enter to start the process    


## Description  

For cloning the project, open the terminal and run this line:  

    - `git clone https://github.com/AmirHoseinEnsafi/miniproject.git`  


## Usage  

Port is set to the `3000`.  
For testing the API, use the tools like `postman`.  

We have two GET methods:  

    - GET http://localhost:3000/books      -> For getting all the books data  
    - GET http://localhost:3000/authors    ->  For getting all the authors data  

To get the information of only one of the books or authors, you must pass the `ObjectId`:  

    - GET http://localhost:3000/authors/{ObjectId}  -> To show the author  
    - GET http://localhost:3000/books/{ObjectId}    -> To show the book  

To delete an author or a book, you need its `ObjectId` same as above:  

    - DELETE http://localhost:3000/authors/{ObjectId}   -> To delete an author  
    - DELETE http://localhost:3000/books/{ObjectId}     -> To delete a book  

To create a book or an author:  

    - POST http://localhost:3000/books      -> To create a book send data in BODY:  
            {bookName, yearPublished, genre, author}    
            If author doesn't exist, you can send the author `ObjectId` to fast create author and automatically insert the `ObjectId` of the new author to tbl_author, you need to send {name, lastName , age}    
    - POST http://localhost:3000/authors    -> To create an author you need to send its data in BODY:  
            {name, lastName, age}  

To update the data for a book and an author, you need to send the `ObjectId`:  

    - PUT http://localhost:3000/authors/{ObjectId}  -> To update and change every property you want, but in length and between number.  
    - PUT http://localhost:3000/books/{ObjectId}    -> To update and change every property you want, but in length and between number.   
