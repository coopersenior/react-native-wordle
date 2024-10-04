
export async function generateWords(length) {
    const apiUrl = 'https://api.datamuse.com/words?sp='+length;
  
    try {
      const response = await fetch(apiUrl);
      const words = await response.json(); 
  
      if (words.length > 0) {
        const randomWord = words[Math.floor(Math.random() * words.length)].word;
        console.log('Random 5-letter word:', randomWord);
        return randomWord;
      } else {
        console.log('No words found.');
        return null;
      }
    } catch (error) {
      console.error('Error fetching words:', error);
      return null;
    }
}

  export async function isWordValid(word) {
    const apiUrl = `https://api.datamuse.com/words?sp=${word}`;
    
    try {
        const response = await fetch(apiUrl); 
        const words = await response.json(); 
        // check if word is valid
        if (words.length > 0 && words[0].word.toLowerCase() === word.toLowerCase()) {
            console.log(`The word "${word}" exists in the dictionary.`);
            return true; // Word found
          } else {
            console.log(`The word "${word}" does not exist in the dictionary.`);
            return false; // Word not found
          }
        } catch (error) {
          console.error('Error checking word:', error);
          return false;
    }
}