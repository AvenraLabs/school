/**
 * Chunks virtual chapter text using RecursiveCharacterTextSplitter logic.
 * Configuration: chunk_size = 700, chunk_overlap = 100
 * Preserves pageStart, pageEnd, and chunkOrder.
 */
export function chunkText({ virtualChapter, chunkSize = 700, chunkOverlap = 100 }) {
  const chunks = [];
  const pages = virtualChapter.pages || [];
  if (pages.length === 0) return chunks;

  let currentChunkText = "";
  let pageStart = pages[0].pageNumber;
  let pageEnd = pages[0].pageNumber;
  let chunkOrder = 1;

  for (const page of pages) {
    const text = page.text || "";
    if (!text.trim()) continue;

    // Split page text into paragraphs or sentences
    const paragraphs = text.split(/\n\s*\n/);

    for (const para of paragraphs) {
      const cleanedPara = para.trim();
      if (!cleanedPara) continue;

      if ((currentChunkText + "\n\n" + cleanedPara).length <= chunkSize) {
        currentChunkText = currentChunkText ? `${currentChunkText}\n\n${cleanedPara}` : cleanedPara;
        pageEnd = page.pageNumber;
      } else {
        // Push completed chunk if available
        if (currentChunkText.length > 0) {
          chunks.push({
            chunkOrder: chunkOrder++,
            text: currentChunkText,
            pageStart,
            pageEnd,
          });
        }

        // Handle paragraph larger than chunk_size by splitting at whitespace/sentences
        if (cleanedPara.length > chunkSize) {
          let remaining = cleanedPara;
          pageStart = page.pageNumber;

          while (remaining.length > 0) {
            let sliceEnd = chunkSize;
            if (remaining.length > chunkSize) {
              const spaceIdx = remaining.lastIndexOf(" ", chunkSize);
              if (spaceIdx > chunkSize / 2) {
                sliceEnd = spaceIdx;
              }
            }

            const chunkPiece = remaining.slice(0, sliceEnd).trim();
            remaining = remaining.slice(sliceEnd).trim();

            if (chunkPiece) {
              chunks.push({
                chunkOrder: chunkOrder++,
                text: chunkPiece,
                pageStart: page.pageNumber,
                pageEnd: page.pageNumber,
              });
            }
          }

          currentChunkText = "";
        } else {
          // Prepare overlap from previous chunk end
          const overlap = currentChunkText.slice(-chunkOverlap);
          currentChunkText = overlap ? `${overlap}\n\n${cleanedPara}` : cleanedPara;
          pageStart = page.pageNumber;
          pageEnd = page.pageNumber;
        }
      }
    }
  }

  // Push final remaining chunk
  if (currentChunkText.trim().length > 0) {
    chunks.push({
      chunkOrder: chunkOrder++,
      text: currentChunkText.trim(),
      pageStart,
      pageEnd,
    });
  }

  return chunks;
}
