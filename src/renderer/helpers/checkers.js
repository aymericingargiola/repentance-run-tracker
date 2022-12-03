export default {
  equalArrays(array1, array2) {
    return (array1.length == array2.length) && array1.every((element, index) => {
      return element === array2[index]; 
    })
  }
}