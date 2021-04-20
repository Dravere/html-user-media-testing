module.exports = {
  module: {
    rules: [
      {
        test: /waveWorker\.min\.js$/,
        use: [{ loader: 'file-loader' }]
      },
      {
        test: /encoderWorker\.min\.js$/,
        use: [{ loader: 'file-loader' }]
      }
    ]
  }
};
