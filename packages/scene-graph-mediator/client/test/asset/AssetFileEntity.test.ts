import { expect } from 'chai';
import { describe, it } from 'mocha';

import AssetFileEntity from '../../src/asset/AssetFileEntity';

describe('AssetFileEntity',  () => {
  const mockPath = '/dev/null.null';

  describe('constructor',  () => {
    it ('should set argument as filePath property', () => {
      const instance = new AssetFileEntity(mockPath);
      expect(instance.filePath).to.equal(mockPath)
    });
    describe('when argument is not an absolute path',  () => {
      it ('should throw Error', () => {
        expect(() => new AssetFileEntity('dev/null')).to.throw(Error);
      });
    });
  });
  describe('instance methods',  () => {
    const instance = new AssetFileEntity(mockPath);

    describe('extension',  () => {
      it('should return extension with period of own filePath property', () => {
        const extension = instance.filePath.split('.').pop();
        expect(instance.extension).to.equal(`.${extension}`);
      });
    });

    describe('relativeLocalPath',  () => {
      it('should remove passed path and return relative path', () => {
        const paths = instance.filePath.split('/');
        const rootDir = paths.shift();
        expect(instance.relativeLocalPath(`/${rootDir}`)).to.equal(paths.join('/'));
      });
    });
  });
});
