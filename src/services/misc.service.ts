export const calculateT9 = (name: string) => {
    const name_l = name.toLowerCase();
    let name_number = '';
    for (let i = 0; i < name_l.length; i++) {
      switch(name_l.charAt(i)) {
        case 'a':
        case 'b':
        case 'c':
          name_number += '2';
          break;
        case 'd':
        case 'e':
        case 'f':
          name_number += '3';
          break;
        case 'g':
        case 'h':
        case 'i':
          name_number += '4';
          break;
        case 'j':
        case 'k':
        case 'l':
          name_number += '5';
          break;
        case 'm':
        case 'n':
        case 'o':
          name_number += '6';
          break;
        case 'p':
        case 'q':
        case 'r':
        case 's':
          name_number += '7';
          break;
        case 't':
        case 'u':
        case 'v':
          name_number += '8';
          break;
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