export const calculateT9 = (name: string) => {
  const name_l = name.toLowerCase();
  let name_number = '';
  for (let i = 0; i < name_l.length; i++) {
    switch (name_l.charAt(i)) {
      case '1':
        name_number += '1';
        break;
      case '2':
      case 'a':
      case 'b':
      case 'c':
        name_number += '2';
        break;
      case '3':
      case 'd':
      case 'e':
      case 'f':
        name_number += '3';
        break;
      case '4':
      case 'g':
      case 'h':
      case 'i':
        name_number += '4';
        break;
      case '5':
      case 'j':
      case 'k':
      case 'l':
        name_number += '5';
        break;
      case '6':
      case 'm':
      case 'n':
      case 'o':
        name_number += '6';
        break;
      case '7':
      case 'p':
      case 'q':
      case 'r':
      case 's':
        name_number += '7';
        break;
      case '8':
      case 't':
      case 'u':
      case 'v':
        name_number += '8';
        break;
      case '9':
      case 'w':
      case 'x':
      case 'y':
      case 'z':
        name_number += '9';
        break;
      default:
        name_number += '0';
        break;
    }
  }
  return name_number;
}