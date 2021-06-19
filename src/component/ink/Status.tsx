import { Box, Text } from 'ink';
import * as React from 'react';

import { StatusProps } from '../shared';

export const Status = (props: StatusProps): JSX.Element => <Box flexDirection="row">
  {props.stats.map((it) => <Box marginRight={1} key={it.name}>
    <Text>{it.name}: {it.value}</Text>
  </Box>)}
</Box>;
