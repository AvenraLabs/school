`PORT=9001 PM2_NAME=voice-tts ./deploy.sh`

# Recommended folder structure
backend/books/
  class6/
    english/
      chapter-1.pdf
  class7/
    science/
      ch-01.pdf

# Ingestion command

`node src/modules/rag/ingestBooks.js ./books`
This creates/updates: backend/rag_data/chroma with collection cbse_books.



# .env backend
`CHROMA_URL=http://localhost:8000`


# install python 
`pip install chromadb`
`chroma run --path ./rag_data/chroma --host 0.0.0.0 --port 8000`


delete rag-data folder for rebuild from scratch

# Notes

Voice features have been removed from the backend, so no local TTS service or `TTS_SERVICE_URL` setup is required.
