You can run ChromaDB in one of two ways:


pip install chromadb
chroma run --path ./rag_data/chroma --host 0.0.0.0 --port 8000


Step C: Configure .env
Ensure your backend .env file points to the running Chroma instance:

env
CHROMA_URL=http://localhost:8000
GEMINI_API_KEY=your_key_here


node src/modules/rag/ingestBooks.js ./books




. How it works right now (Global Vector Search)
Currently, the search is global across all books, meaning:

The folder structure (like /books/class6/science/) is only used to generate the source citation at the bottom of the answer (e.g. “Source: Class 6 - Science”).
ChromaDB searches the entire vector database globally. It does not restrict the search to only that student's class folder.
Why it doesn't clash: Vector embeddings search by semantic meaning. If a Class 6 student asks a simple question (e.g., "What are the parts of a plant?"), the vector search will naturally match the simple terminology in the Class 6 Science book rather than a complex biology book, because the vocabulary is a closer match.