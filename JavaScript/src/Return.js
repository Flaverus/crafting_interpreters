class Return extends Error {
  constructor(value) {
    super(null, null, false, false); // No message
    this.name = 'Return';
    this.value = value;
  }
}

export default Return;