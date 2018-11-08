import { expect } from 'chai';
import { describe, it } from 'mocha';

import * as sg from '../src/index';

describe('exported object',  () => {
  it('should contain "sgmed" namespace', () => {
    expect(sg.sgmed).to.not.equal(undefined);
  });
  it('should contain "cli" namespace', () => {
    expect(sg.cli).to.not.equal(undefined);
  });
});
