
let numbers = [750, 2219, 50, 1, 8, 3, 2, 6, 20, 30, 50, 60, 70, 33, 11, 90, 128];

const compare = (arr, left, right) => {
    let temp;
    if (arr[left] > arr[right]) {
        temp = arr[left];
        arr[left] = arr[right];
        arr[right] = temp;
    }
};

const sort = (arr, length) => {
    let i;
    let j;
    let temp;

    i = 0;
    j = (length - 1);
    while (j > 0) {
        while (i < j) {
            compare(arr, i, j);
            i++;
        }
        i = 0;
        j--;
    }
    return arr;
}

numbers = sort(numbers, numbers.length);
console.log(numbers);
