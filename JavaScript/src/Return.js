// Used class as I had no idea on how to deal with that differently...
class Return extends Error {
  constructor(value) {
    super(null, null, false, false); // No message
    this.name = 'Return';
    this.value = value;
  }
}

export default Return;