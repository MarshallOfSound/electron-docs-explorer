import * as React from 'react';
import { Box, Color } from 'ink';
import {
  ParsedDocumentationResult,
  EventDocumentationBlock,
  ModuleDocumentationContainer,
  ClassDocumentationContainer,
  StructureDocumentationContainer,
  ElementDocumentationContainer,
  MethodDocumentationBlock,
  PropertyDocumentationBlock,
} from '@electron/docs-parser';
import * as Fuse from 'fuse.js';

const api: ParsedDocumentationResult = require('../electron-api.json');

interface Props {
  query: string;
}

export class ResultsViewer extends React.Component<Props> {
  get moduleResults() {
    const fuse = new Fuse(api, {
      keys: [
        {
          name: 'name',
          weight: 0.7,
        },
      ],
      threshold: 0.1,
      includeScore: true,
    });
    return fuse.search(this.props.query).map(r => ({
      ...r,
      resultType: 'module' as 'module',
    }));
  }

  get eventResults() {
    const fuse = new Fuse(
      api.reduce<
        {
          event: EventDocumentationBlock;
          module:
            | ModuleDocumentationContainer
            | ClassDocumentationContainer
            | StructureDocumentationContainer
            | ElementDocumentationContainer;
        }[]
      >(
        (all, module) => [
          ...all,
          ...(module.events || []).map(e => ({ event: e, module })),
          ...(module.instanceEvents || []).map(e => ({ event: e, module })),
        ],
        [],
      ),
      {
        keys: [
          {
            name: 'event.name',
            weight: 0.5,
          },
          {
            name: 'event.description',
            weight: 0.3,
          },
          {
            name: 'event.parameters.name',
            weight: 0.1,
          },
          {
            name: 'event.parameters.properties.name',
            weight: 0.1,
          },
          {
            name: 'event.parameters.properties.properties.name',
            weight: 0.1,
          },
        ],
        threshold: 0.1,
        includeScore: true,
      },
    );
    return fuse.search(this.props.query).map(r => ({
      ...r,
      resultType: 'event' as 'event',
    }));
  }

  get methodResults() {
    const fuse = new Fuse(
      api.reduce<
        {
          method:
            | MethodDocumentationBlock
            | Pick<MethodDocumentationBlock, 'signature' | 'parameters'>;
          module:
            | ModuleDocumentationContainer
            | ClassDocumentationContainer
            | StructureDocumentationContainer
            | ElementDocumentationContainer;
        }[]
      >(
        (all, module) => [
          ...all,
          ...(module.methods || []).map(m => ({ method: m, module })),
          ...(module.instanceMethods || []).map(m => ({ method: m, module })),
          ...(module.staticMethods || []).map(m => ({ method: m, module })),
          ...(module.constructorMethod ? [module.constructorMethod] : []).map(m => ({
            method: m,
            module,
          })),
        ],
        [],
      ),
      {
        keys: [
          {
            name: 'method.name',
            weight: 0.5,
          },
          {
            name: 'method.description',
            weight: 0.3,
          },
          {
            name: 'method.parameters.name',
            weight: 0.1,
          },
          {
            name: 'method.parameters.properties.name',
            weight: 0.1,
          },
          {
            name: 'method.parameters.properties.properties.name',
            weight: 0.1,
          },
        ],
        threshold: 0.1,
        includeScore: true,
      },
    );
    return fuse.search(this.props.query).map(r => ({
      ...r,
      resultType: 'method' as 'method',
    }));
  }

  get propertyResults() {
    const fuse = new Fuse(
      api.reduce<
        {
          property: PropertyDocumentationBlock;
          module:
            | ModuleDocumentationContainer
            | ClassDocumentationContainer
            | StructureDocumentationContainer
            | ElementDocumentationContainer;
        }[]
      >(
        (all, module) => [
          ...all,
          ...(module.properties || []).map(m => ({ property: m, module })),
          ...(module.instanceProperties || []).map(m => ({ property: m, module })),
          ...(module.staticProperties || []).map(m => ({ property: m, module })),
        ],
        [],
      ),
      {
        keys: [
          {
            name: 'property.name',
            weight: 0.5,
          },
          {
            name: 'property.description',
            weight: 0.3,
          },
          {
            name: 'property.type',
            weight: 0.1,
          },
          {
            name: 'property.type.properties.name',
            weight: 0.1,
          },
          {
            name: 'property.type.properties.properties.name',
            weight: 0.1,
          },
        ],
        threshold: 0.1,
        includeScore: true,
      },
    );
    return fuse.search(this.props.query).map(r => ({
      ...r,
      resultType: 'property' as 'property',
    }));
  }

  render() {
    const results = [
      ...this.moduleResults,
      ...this.eventResults,
      ...this.methodResults,
      ...this.propertyResults,
    ]
      .sort((a, b) => (a.score || 0) - (b.score || 0))
      .slice(0, 5);

    return (
      <Box flexDirection="column">
        {results.map(result =>
          result.resultType === 'module' ? (
            <Box paddingBottom={1} key={result.item.name} flexDirection="column">
              <Box>
                <Color bgCyan black>
                  Type: {result.item.type}
                </Color>
              </Box>
              <Box>
                <Color bgCyan black>
                  Module Name: {result.item.name}
                </Color>
              </Box>
            </Box>
          ) : result.resultType === 'event' ? (
            <Box
              paddingBottom={1}
              key={`${result.item.module.name}_event_${result.item.event.name}`}
              flexDirection="column"
            >
              <Box>
                <Color bgYellow black>
                  Type: Event
                </Color>
              </Box>
              <Box>
                <Color bgYellow black>
                  Module: {result.item.module.name}
                </Color>
              </Box>
              <Box>
                <Color bgYellow black>
                  Name: {result.item.event.name}
                </Color>
              </Box>
              <Box>{result.item.event.description}</Box>
            </Box>
          ) : result.resultType === 'method' ? (
            <Box
              paddingBottom={1}
              key={`${result.item.module.name}_method_${(result.item.method as any).name ||
                'constructor'}`}
              flexDirection="column"
            >
              <Box>
                <Color bgGreen black>
                  Type: Method
                </Color>
              </Box>
              <Box>
                <Color bgGreen black>
                  Module: {result.item.module.name}
                </Color>
              </Box>
              <Box>
                <Color bgGreen black>
                  Name: {(result.item.method as any).name || `new ${result.item.module.name}()`}
                </Color>
              </Box>
              <Box>
                {(
                  (result.item.method as any).description ||
                  `${result.item.module.name} Constructor`
                ).trim()}
              </Box>
            </Box>
          ) : (
            <Box
              paddingBottom={1}
              key={`${result.item.module.name}_property_${result.item.property.name}`}
              flexDirection="column"
            >
              <Box>
                <Color bgBlue black>
                  Type: Property
                </Color>
              </Box>
              <Box>
                <Color bgBlue black>
                  Module: {result.item.module.name}
                </Color>
              </Box>
              <Box>
                <Color bgBlue black>
                  Name: {result.item.property.name}
                </Color>
              </Box>
              <Box>{result.item.property.description}</Box>
            </Box>
          ),
        )}
      </Box>
    );
  }
}
