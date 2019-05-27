#!/usr/bin/env node

import * as React from 'react';
import { render, Box } from 'ink';
import TextInput from 'ink-text-input';
import { ResultsViewer } from './ResultsViewer';

interface State {
  query: string;
}

class App extends React.Component<{}, State> {
  state: State = {
    query: '',
  };

  private updateQuery = (query: string) => {
    this.setState({ query });
  };

  render() {
    return (
      <Box flexDirection="column">
        <Box>
          <Box paddingRight={1}>Query:</Box>
          <TextInput value={this.state.query} onChange={this.updateQuery} />
        </Box>
        <Box>
          {this.state.query.length >= 3 ? (
            <ResultsViewer query={this.state.query} />
          ) : (
            <Box>{this.state.query ? 'Keep' : 'Start'} typing for results to appear...</Box>
          )}
        </Box>
      </Box>
    );
  }
}

render(<App />);
