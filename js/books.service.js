const bookService = (function() {
  const STORAGE_KEY = 'bookshop_books'

  function getBooks() {
      const books = loadFromStorage(STORAGE_KEY)
      if (!books) {
          const demoBooks = [
              {
                  id: 'bg4J78',
                  title: 'The Adventures of Lori Ipsi',
                  price: 120,
                  imgUrl: 'img/lori-ipsi-cover.jpg',
                  rating: 4.5
              },
              {
                  id: 'wa9K34',
                  title: 'World Atlas',
                  price: 300,
                  imgUrl: 'img/world-atlas.jpg',
                  rating: 4.0
              },
              {
                  id: 'zg1F56',
                  title: 'Zorba the Greek',
                  price: 87,
                  imgUrl: 'img/zorba-greek.jpg',
                  rating: 3.8
              },
              {
                  id: 'gc1D23',
                  title: 'Game of Codes',
                  price: 150,
                  imgUrl: '',
                  rating: 4.7
              },
              {
                  id: 'mt9H45',
                  title: 'The Maze Typer',
                  price: 110,
                  imgUrl: 'img/the-maze-typer.png',
                  rating: 4.2
              }
          ]
          _saveBooks(demoBooks)
          return demoBooks
      }
      return books
  }

  function deleteBook(bookId) {
      let books = getBooks()
      books = books.filter(book => book.id !== bookId)
      _saveBooks(books)
  }

  function updatePrice(bookId, newPrice) {
      const books = getBooks()
      const book = books.find(book => book.id === bookId)
      if (book) {
          book.price = newPrice
          _saveBooks(books)
      }
  }

  function addBook(title, price, imgUrl, rating) {
      const books = getBooks()
      const newBook = {
          id: generateId(),
          title,
          price,
          imgUrl,
          rating
      }
      books.push(newBook)
      _saveBooks(books)
  }

  function generateId() {
      return Math.random().toString(36).substr(2, 9)
  }

  function _saveBooks(books) {
      saveToStorage(STORAGE_KEY, books)
  }

  // Local storage utility functions
  function loadFromStorage(key) {
      const json = localStorage.getItem(key)
      return json ? JSON.parse(json) : null
  }

  function saveToStorage(key, value) {
      localStorage.setItem(key, JSON.stringify(value))
  }

  return {
      getBooks,
      deleteBook,
      updatePrice,
      addBook
  }
})()





  

  