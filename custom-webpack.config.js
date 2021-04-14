module.exports = {
  module: {
    rules: [
      {
        test: /waveWorker\.min\.js$/,
        use: [{ loader: 'file-loader' }]
      }
    ]
  }
};
