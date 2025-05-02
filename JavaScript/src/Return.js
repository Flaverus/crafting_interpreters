class Return extends Error {
  constructor(value) {
      console.log('RETURN INSIDE THROW')
    super(null, null, false, false); // No message
    this.name = 'Return';
    this.value = value;
  }
}

export default Return;