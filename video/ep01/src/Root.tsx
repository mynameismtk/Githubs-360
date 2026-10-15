import React from 'react';
import {Composition} from 'remotion';
import {Ad, FPS, DURATION} from './Ad';

// Meriva Medical Centre - "Before it becomes big", Ep. 01 "The Ignored Headache". 25 s, 9:16, 24 fps.
// AdClean: end card with the verified website only. AdPlaceholder: the same cut with a marked slot for the
// clinic phone / address, to be filled once Meriva supplies them.
export const Root: React.FC = () => (
  <>
    <Composition id="AdClean" component={Ad} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{placeholder: false}} />
    <Composition id="AdPlaceholder" component={Ad} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{placeholder: true}} />
  </>
);
