const bookController = (function() {
  function onInit() {
      render()
      bindAddBookButton()
      bindFilterInput()
      bindToggleViewButton()
  }

  function render(filter = '') {
      const books = bookService.getBooks()
      const tableBody = document.querySelector('tbody')
      const gridContainer = document.querySelector('#book-cards-container')
      const tableView = document.querySelector('#book-table-view')
      const gridView = document.querySelector('#book-grid-view')
      const isGridView = gridView.classList.contains('hidden') === false

      tableBody.innerHTML = ''
      gridContainer.innerHTML = ''

      const filteredBooks = books.filter(book =>
          book.title.toLowerCase().includes(filter.toLowerCase())
      )

      if (filteredBooks.length === 0) {
          if (!isGridView) {
              tableBody.innerHTML = '<tr><td colspan="4">No matching books were found...</td></tr>'
          } else {
              gridContainer.innerHTML = '<p>No matching books were found...</p>'
          }
      } else {
          filteredBooks.forEach(book => {
              if (!isGridView) {
                  // Render Table Row
                  const row = document.createElement('tr')

                  // Title Cell
                  const titleCell = document.createElement('td')
                  titleCell.textContent = book.title
                  row.appendChild(titleCell)

                  // Price Cell
                  const priceCell = document.createElement('td')
                  priceCell.textContent = book.price
                  row.appendChild(priceCell)

                  // Rating Cell
                  const ratingCell = document.createElement('td')
                  ratingCell.textContent = book.rating ? `${book.rating} / 5` : 'N/A'
                  row.appendChild(ratingCell)

                  // Actions Cell
                  const actionsCell = document.createElement('td')
                  actionsCell.appendChild(createActionButton('Read', 'read-button', () => onReadBook()))
                  actionsCell.appendChild(createActionButton('Update', 'update-button', () => onUpdateBook(book.id, book.price)))
                  actionsCell.appendChild(createActionButton('Delete', 'delete-button', () => onRemoveBook(book.id)))
                  actionsCell.appendChild(createActionButton('Details', 'details-button', () => onShowBookDetails(book)))

                  row.appendChild(actionsCell)
                  tableBody.appendChild(row)
              } else {
                  // Render Grid Card
                  const card = document.createElement('div')
                  card.classList.add('book-card')

                  const cardTitle = document.createElement('h3')
                  cardTitle.textContent = book.title
                  card.appendChild(cardTitle)

                  const cardPrice = document.createElement('p')
                  cardPrice.textContent = `Price: ${book.price}`
                  card.appendChild(cardPrice)

                  const cardRating = document.createElement('p')
                  cardRating.textContent = `Rating: ${book.rating ? book.rating : 'N/A'} / 5`
                  card.appendChild(cardRating)

                  const cardActions = document.createElement('div')
                  cardActions.classList.add('card-actions')

                  cardActions.appendChild(createActionButton('Read', 'read-button', () => onReadBook()))
                  cardActions.appendChild(createActionButton('Update', 'update-button', () => onUpdateBook(book.id, book.price)))
                  cardActions.appendChild(createActionButton('Delete', 'delete-button', () => onRemoveBook(book.id)))
                  cardActions.appendChild(createActionButton('Details', 'details-button', () => onShowBookDetails(book)))

                  card.appendChild(cardActions)
                  gridContainer.appendChild(card)
              }
          })
      }

      updateStatistics(books)
  }

  function createActionButton(text, className, onClick) {
      const button = document.createElement('button')
      button.textContent = text
      button.classList.add(className)
      button.addEventListener('click', onClick)
      return button
  }

  function onRemoveBook(bookId) {
      bookService.deleteBook(bookId)
      render()
      showSuccessMessage('Book successfully deleted')
  }

  function onUpdateBook(bookId, currentPrice) {
    const updateBookModal = document.querySelector('#update-book-modal')
    if (!updateBookModal) {
        console.error('Update book modal not found')
        return
    }

    const updateBookPriceInput = updateBookModal.querySelector('#update-book-price')
    updateBookPriceInput.value = currentPrice
    updateBookModal.classList.remove('hidden')

    const saveButton = updateBookModal.querySelector('.save-button')
    const cancelButton = updateBookModal.querySelector('.cancel-button')

    // Replace `addEventListener` with `onclick` to ensure no multiple listeners
    saveButton.onclick = () => {
        const newPrice = parseFloat(updateBookPriceInput.value.trim())
        if (!isNaN(newPrice) && newPrice > 0) {
            bookService.updatePrice(bookId, Number(newPrice))
            render()
            showSuccessMessage('Book successfully updated')
            updateBookModal.classList.add('hidden')
            updateBookPriceInput.value = ''
        } else {
            alert('Invalid price entered. Please provide a numeric price.')
        }
    }

    cancelButton.onclick = () => {
        updateBookModal.classList.add('hidden')
        updateBookPriceInput.value = ''
    }
}

function onAddBook() {
  const addBookModal = document.querySelector('#add-book-modal')
  if (!addBookModal) {
      console.error('Add book modal not found')
      return
  }

  const addBookTitleInput = addBookModal.querySelector('#add-book-title')
  const addBookPriceInput = addBookModal.querySelector('#add-book-price')
  const addBookImageInput = addBookModal.querySelector('#add-book-image')
  const addBookRatingInput = addBookModal.querySelector('#add-book-rating')
  addBookModal.classList.remove('hidden')

  const saveButton = addBookModal.querySelector('.save-button')
  const cancelButton = addBookModal.querySelector('.cancel-button')

  saveButton.onclick = () => {
      const title = addBookTitleInput.value.trim()
      const price = addBookPriceInput.value.trim()
      const rating = addBookRatingInput.value.trim()
      const imageFile = addBookImageInput.files[0]

      if (title && price && !isNaN(price) && rating && !isNaN(rating)) {
          if (imageFile) {
              const reader = new FileReader()
              reader.onload = function(event) {
                  const imgUrl = event.target.result // Base64 encoded image

                  bookService.addBook(title, Number(price), imgUrl, Number(rating))
                  render()
                  showSuccessMessage('Book successfully added')
                  addBookModal.classList.add('hidden')
                  addBookTitleInput.value = ''
                  addBookPriceInput.value = ''
                  addBookImageInput.value = ''
                  addBookRatingInput.value = ''
              }
              reader.readAsDataURL(imageFile)
          } else {
              // If no image is uploaded, use a default image
              const imgUrl = 'images/default-cover.png'
              bookService.addBook(title, Number(price), imgUrl, Number(rating))
              render()
              showSuccessMessage('Book successfully added')
              addBookModal.classList.add('hidden')
              addBookTitleInput.value = ''
              addBookPriceInput.value = ''
              addBookImageInput.value = ''
              addBookRatingInput.value = ''
          }
      } else {
          alert('Invalid title, price, or rating entered. Please provide valid inputs.')
      }
  }

  cancelButton.onclick = () => {
      addBookModal.classList.add('hidden')
      addBookTitleInput.value = ''
      addBookPriceInput.value = ''
      addBookImageInput.value = ''
      addBookRatingInput.value = ''
  }
}



  function bindAddBookButton() {
      const addBookButton = document.querySelector('#add-book-button')
      addBookButton.addEventListener('click', onAddBook)
  }

  function bindFilterInput() {
      const filterInput = document.querySelector('#filter-input')
      const clearFilterButton = document.querySelector('#clear-filter-button')
      filterInput.addEventListener('input', () => {
          render(filterInput.value)
      })
      clearFilterButton.addEventListener('click', () => {
          filterInput.value = ''
          render()
      })
  }

  function bindToggleViewButton() {
      const toggleViewButton = document.querySelector('#toggle-view-button')
      const tableView = document.querySelector('#book-table-view')
      const gridView = document.querySelector('#book-grid-view')

      toggleViewButton.addEventListener('click', () => {
          if (tableView.classList.contains('hidden')) {
              gridView.classList.add('hidden')
              tableView.classList.remove('hidden')
              toggleViewButton.textContent = 'Switch to Grid View'
              localStorage.setItem('preferredView', 'table')
          } else {
              tableView.classList.add('hidden')
              gridView.classList.remove('hidden')
              toggleViewButton.textContent = 'Switch to Table View'
              localStorage.setItem('preferredView', 'grid')
          }
          render()
      })

      document.addEventListener('DOMContentLoaded', () => {
          const preferredView = localStorage.getItem('preferredView')
          if (preferredView === 'grid') {
              tableView.classList.add('hidden')
              gridView.classList.remove('hidden')
              toggleViewButton.textContent = 'Switch to Table View'
          } else {
              gridView.classList.add('hidden')
              tableView.classList.remove('hidden')
              toggleViewButton.textContent = 'Switch to Grid View'
          }
      })
  }

  function onShowBookDetails(book) {
    const modal = document.querySelector('#book-details-modal')
    const bookDetailsElement = document.querySelector('#book-details')

    // Clear previous content
    bookDetailsElement.innerHTML = ''

    // Add new book details along with the cover image
    bookDetailsElement.innerHTML = `
        <div><strong>Title:</strong> ${book.title}</div>
        <div><strong>Price:</strong> ${book.price}</div>
        <div><strong>Rating:</strong> ${book.rating ? book.rating : 'N/A'} / 5</div>
        <div><strong>ID:</strong> ${book.id}</div>
        <img src="img/${book.imgUrl}" alt="Book Cover for ${book.title}" style="max-width: 100%; margin-top: 15px;">
    `
    modal.classList.remove('hidden')

    const closeButton = modal.querySelector('.close-button')
    closeButton.removeEventListener('click', closeDetailsModal)
    closeButton.addEventListener('click', closeDetailsModal)
}


  function closeDetailsModal() {
      const modal = document.querySelector('#book-details-modal')
      modal.classList.add('hidden')
  }

  function onReadBook() {
      const readBookModal = document.querySelector('#read-book-modal')
      readBookModal.classList.remove('hidden')

      const closeButton = readBookModal.querySelector('.close-button')
      closeButton.removeEventListener('click', closeReadModal)
      closeButton.addEventListener('click', closeReadModal)
  }

  function closeReadModal() {
      const modal = document.querySelector('#read-book-modal')
      modal.classList.add('hidden')
  }

  function showSuccessMessage(message) {
      const successMessage = document.createElement('div')
      successMessage.className = 'success-message'
      successMessage.textContent = message
      document.body.appendChild(successMessage)

      setTimeout(() => {
          document.body.removeChild(successMessage)
      }, 2000)
  }

  function updateStatistics(books) {
      const expensiveBooks = books.filter(book => book.price > 200).length
      const averageBooks = books.filter(book => book.price >= 80 && book.price <= 200).length
      const cheapBooks = books.filter(book => book.price < 80).length

      document.querySelector('#expensive-books-count').textContent = expensiveBooks
      document.querySelector('#average-books-count').textContent = averageBooks
      document.querySelector('#cheap-books-count').textContent = cheapBooks
  }

  return {
      onInit
  }
})()

bookController.onInit()








