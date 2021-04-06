import * as through2 from 'through2';

export const batchingStream = (batchSize = 100) => {
  let buffer = [];

  return through2.obj(
    function transform(item, encoding, done) {
      buffer.push(item);

      if (buffer.length >= batchSize) {
        this.push(buffer);
        buffer = [];
      }

      done();
    },
    function flush(done) {
      if (buffer.length) {
        this.push(buffer);
      }
      done();
    },
  );
};

export const unbatchingStream = () =>
  through2.obj(function transform(batch, encoding, done) {
    for (const item of batch) {
      this.push(item);
    }
    done();
  });
