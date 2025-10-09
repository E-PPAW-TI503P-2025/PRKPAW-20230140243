 	const express = require('express');
 	const router = express.Router();
 	
 	let books = [
 	  {id: 1, title: 'Book 1', author: 'Author 1'},
 	  {id: 2, title: 'Book 2', author: 'Author 2'}
 	];
 	
 	router.get('/', (req, res) => {
 	  res.json(books);
 	});
 	
 	router.get('/:id', (req, res) => {
 	  const book = books.find(b => b.id === parseInt(req.params.id));
 	  if (!book) return res.status(404).send('Book not found');
 	  res.json(book);
 	});
 	
 	router.post('/', (req, res) => {
 	  const { title, author } = req.body;
 	  if (!title || !author) {
 	      return res.status(400).json({ message: 'Title and author are required' });
 	  }
 	  const book = {
 	    id: books.length + 1,
 	    title,
 	    author
 	  };
 	  books.push(book);
 	  res.status(201).json(book);
 	});

	router.put('/:id', (req, res) => {
    // 1. Cari buku
    const id = parseInt(req.params.id);
    const bookIndex = books.findIndex(b => b.id === id);

    // 2. Validasi: Jika buku tidak ditemukan (404)
    if (bookIndex === -1) {
        return res.status(404).json({ message: 'Book not found' });
    }

    // 3. Validasi: Pastikan data title dan author ada (400)
    const { title, author } = req.body;
    if (!title || !author) {
        return res.status(400).json({ message: 'Title and author are required' });
    }

    // 4. Perbarui data
    books[bookIndex] = {
        id: id, // ID tetap sama
        title,
        author
    };

    // 5. Kirim data buku yang diperbarui
    res.json(books[bookIndex]);
});

router.delete('/:id', (req, res) => {
    // 1. Cari index buku
    const id = parseInt(req.params.id);
    const initialLength = books.length;
    
    // 2. Hapus buku (membuat array baru tanpa buku dengan ID tersebut)
    books = books.filter(b => b.id !== id);

    // 3. Validasi: Jika panjang array tidak berubah, berarti buku tidak ditemukan (404)
    if (books.length === initialLength) {
        return res.status(404).json({ message: 'Book not found' });
    }

    // 4. Kirim status 204 (No Content) karena penghapusan berhasil
    res.status(204).send();
});
 	
 	module.exports = router;
