import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, Alert, Pressable } from 'react-native';
import {colors, CLEAR, ENTER} from './src/constants';
import Keyboard from './src/components/Keyboard';
import { generateWords, isWordValid } from './src/components/GererateWord';

const copyArray = (arr) => {
  return [...arr.map((rows) => [...rows])];
}

export default function App() {
  const [word, setWord] = useState("");
  // states for user chosen word lengths 
  const [wordLengthToken, setWordLengthToken] = useState("?????");
  const [numberOfTries, setNumberOfTries] = useState(6);
  
  const reset = async () => {
    const word = await generateWords(wordLengthToken);
  
    if (!word) {
      console.error('No valid word returned.');
      return;
    }

    setWord(word);
    const letters = word.split("");
    setRows(new Array(numberOfTries).fill(new Array(letters.length).fill("")));
    setCurCol(0);
    setCurRow(0);
    setGameState('playing');
  };

  useEffect(() => {
    reset(); 
  }, []); 

  var wordLength = word.length;
  const letters = word.split("");

  const [rows, setRows] = useState(new Array(numberOfTries).fill(
    new Array(letters.length).fill("")
  ));

  const [curRow, setCurRow] = useState(0);
  const [curCol, setCurCol] = useState(0);

  const [gameState, setGameState] = useState('playing');

  useEffect(() => {
    if (curRow > 0) {
      checkGameState();
    }
  }, [curRow]);

  const checkGameState = async () => {
    const won = await checkIfWon(); 
    const lost = checkIfLost();
  
    if (won === true) {
      setGameState('won');
      Alert.alert('Nice', "You won!");
    } else if (lost === true) {
      setGameState('lost');
        Alert.alert(word.toUpperCase(), "Try again!");
    }
  };

  const checkIfWon = async () => {
    const row = rows[curRow - 1];
    const makeWord = row.join('');
  
    const isValid = await isWordValid(makeWord);
  
    if (isValid === true) {
      return row.every((letter, i) => letter === letters[i]);
    } else {
      return false;
    }
  };

  const checkIfLost = () => {
    return curRow === rows.length;
  };

  const setWordLength = async (len) => {
    // Update the token based on the length to match the API call syntax
    if (len === 4) {
      setWordLengthToken('????');
      setNumberOfTries(5);
    } else if (len === 5) {
      setWordLengthToken('?????'); 
      setNumberOfTries(6);
    } else if (len === 6) {
      setWordLengthToken('??????'); 
      setNumberOfTries(7);
    }
  };

  useEffect(() => {
    reset();
  }, [wordLengthToken]);

  const onKeyPressed = async (key) => {
    if (gameState !== 'playing') {
      return;
    }
    const updatedRows = copyArray(rows);

    if (key === CLEAR) {
      const prevCol = curCol - 1;
      if (prevCol >= 0) {
        updatedRows[curRow][prevCol] = "";
        setRows(updatedRows);
        setCurCol(curCol - 1);
      }
      return;
    }

    if (key === ENTER) {
      const makeWord = rows[curRow].join('');
      const isValid = await isWordValid(makeWord);

      // checks if word is valid in dictionary
      if (isValid === true) {
        if (curCol === rows[0].length) {
          setCurRow(curRow + 1);
          setCurCol(0);
        }
      } else {
        Alert.alert('Word not in word list!');
        return; 
      }
      return;
    }

    if (curCol < rows[0].length) {
      updatedRows[curRow][curCol] = key;
      setRows(updatedRows);
      setCurCol(curCol + 1);
    }
  };

  const isCellActive = (row, col) => {
      return row === curRow && col === curCol;
  };
  
  const getCellBGColor = (row, col) => {
    const letter = rows[row][col];

    if (row >= curRow) {
      return colors.black;
    }
    if (letter === letters[col]) {
      return colors.primary;
    }
    if (letters.includes(letter)) {
      return colors.secondary;
    }
    return colors.darkgrey;
  }

  const getAllLettersWithColor = (color) => {
    return rows.flatMap((row, i) => 
      row.filter((cell, j) => getCellBGColor(i, j) === color)
    );
  }

  const greenCaps = getAllLettersWithColor(colors.primary);
  const yellowCaps = getAllLettersWithColor(colors.secondary);
  const greyCaps = getAllLettersWithColor(colors.darkgrey);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <Text style={styles.title}>WORDLE</Text>

      <View style={styles.buttons}>
        <Pressable
          onPress={() => reset()}
        >
          <View style={styles.button}>
            <Text style={styles.reset}>New Word</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => setWordLength(4)}
        >
          <View style={[styles.button, {backgroundColor: wordLength == 4 ? colors.primary : colors.grey}]}>
            <Text style={styles.reset}>4</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => setWordLength(5)}
        >
          <View style={[styles.button, {backgroundColor: wordLength == 5 ? colors.primary : colors.grey}]}>
            <Text style={styles.reset}>5</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => setWordLength(6)}
        >
          <View style={[styles.button, {backgroundColor: wordLength == 6 ? colors.primary : colors.grey}]}>
            <Text style={styles.reset}>6</Text>
          </View>
        </Pressable>

      </View>

      <View style={styles.map}>  
        {rows.map((row, i) => (
          <View key={`row-${i}`} style={styles.row}>
            {row.map((letter, j) => (
              <View key={`cell-${i}-${j}`} style={[styles.cell, 
                  {
                    borderColor: isCellActive(i, j) &&  gameState === 'playing'? colors.lightgrey : colors.darkgrey,
                    backgroundColor: getCellBGColor(i, j),
                  },
                ]}> 
                <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <Keyboard 
        onKeyPressed={onKeyPressed} 
        greenCaps={greenCaps} 
        yellowCaps={yellowCaps} 
        greyCaps={greyCaps}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    alignItems: 'center',
  },
  title: {
    color: colors.lightgrey,
    fontSize: 32, 
    fontWeight: "bold",
    letterSpacing: 7,
    paddingBottom: 20,
  },
  map: {
    alignSelf: 'stretch',
    marginVertical: 30,
  },
  row: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cell: {
    borderWidth: 3,
    borderColor: colors.darkgrey,
    flex: 1,
    maxWidth: 70,
    aspectRatio: 1,
    margin: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    color: colors.lightgrey,
    fontWeight: 'bold',
    fontSize: 28,

  },
  reset: {
    color: colors.lightgrey,
    fontSize: 20, 
    fontWeight: "bold",
  },
  button: {
    borderWidth: 2,
    margin: 2,
    borderRadius: 5,
    padding: 5,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    backgroundColor: colors.grey,
  },
  buttons: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
