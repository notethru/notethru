import { readFileSync } from 'node:fs';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

let fromMarkdown: Function;
let visit: Function;


@Injectable()
export class CompilerService {
  constructor(private prisma: PrismaService) {}

  //global functions
  private startPos: number;
  private endPos: number;
  private getCustomSyntaxFromPileOfText(str: string) {
    let allCustomSyntaxUsageInTextNode = [];

    for (let i = 0; i < str.length; i++) {
      let char = str[i];

      if (char === '<') {
        if (str[i + 1] === '-') {
          if (str[i + 2] == '-') {
            this.startPos = i;
          }
        }
      } else if (char === '>') {
        if (str[i - 1] === '!') {
          if (this.startPos !== undefined || this.startPos !== null) {
            this.endPos = i;
            allCustomSyntaxUsageInTextNode.push({
              startIndex: this.startPos,
              endIndex: this.endPos + 1,
              image: str.slice(this.startPos, this.endPos + 1),
            });

            this.startPos;
            this.endPos;
          }
        }
      }
    }
    return { tokens: allCustomSyntaxUsageInTextNode };
  }

  private getAllVariablesInSyntax(str: string, variableLocation) {
    let allVariables = [];

    variableLocation.forEach((variable, index) => {
      let allTokensInSyntax = [];

      let variableName = '';
      let variableType = '';
      let variableValue = '';

      const nextEntery = variableLocation[index + 1];
      if (variable.token === '[') {
        if (nextEntery.token === ']') {
          //here we are adding one to index of nextEntery, because by not adding
          // it does not give last ] of variable syntax which is required.
          const customVariable = str.slice(
            variable.index,
            nextEntery.index + 1,
          );
          const customVariableWithWhiteSpacesRemoved = customVariable.replace(
            /\s/g,
            '',
          );

          for (
            let i = 0;
            i < customVariableWithWhiteSpacesRemoved.length;
            i++
          ) {
            const char = customVariableWithWhiteSpacesRemoved[i];

            if (char === '[')
              allTokensInSyntax.push({
                token: '[',
                index: i,
              });
            else if (char === ':')
              allTokensInSyntax.push({
                token: ':',
                index: i,
              });
            else if (char === '=')
              allTokensInSyntax.push({
                token: '=',
                index: i,
              });
            else if (char === ']')
              allTokensInSyntax.push({
                token: ']',
                index: i,
              });
          }

          allTokensInSyntax.forEach((token, index) => {
            if (token.token === '[') {
              const next = allTokensInSyntax[index + 1];

              if (next.token === ':') {
                variableName = customVariableWithWhiteSpacesRemoved.slice(
                  token.index + 1,
                  next.index,
                );
              }
            } else if (token.token === '=') {
              const prev = allTokensInSyntax[index - 1];

              if (prev.token === ':') {
                variableType = customVariableWithWhiteSpacesRemoved.slice(
                  prev.index + 1,
                  token.index,
                );
              }
            } else if (token.token === ']') {
              const prev = allTokensInSyntax[index - 1];

              if (prev.token === '=') {
                variableValue = customVariableWithWhiteSpacesRemoved.slice(
                  prev.index + 1,
                  token.index,
                );
              }
            }
          });

          allVariables.push({
            name: variableName,
            type: variableType,
            value: variableValue,
          });
        }
      }
    });
    return allVariables;
  }

  async compile(path: string) {
    const doc = readFileSync(path, 'utf-8');
    await import('mdast-util-from-markdown').then((a) => {
      fromMarkdown = a.fromMarkdown;
    });
    await import('unist-util-visit').then((a) => {
      visit = a.visit;
    });
    let tree = fromMarkdown(doc);

    let arrayOfTextNodes = [];
    visit(tree, 'text', (d) => {
      arrayOfTextNodes.push(d);
    });

    let finderLexing: any = { tokens: [] };
    let variablesInCustomSyntax = [];
    let whiteSpacesInCustomSyntax = [];
    let bigBracesInCustomSyntax = [];
    let colonsInCustomSyntax = [];
    let exclamationInCustomSyntax = []
    arrayOfTextNodes.forEach((textNode, textNodeIndex) => {
      finderLexing = this.getCustomSyntaxFromPileOfText(textNode.value);

      if (finderLexing.tokens.length > 0) {
        finderLexing.tokens.forEach(async (token) => {
          const stringToBeTokenized = token.image;

          for (let i = 0; i < stringToBeTokenized.length; i++) {
            const char = stringToBeTokenized[i];
            if (char === ' ') {
              whiteSpacesInCustomSyntax.push({ index: i, token: ' ' });
            } else if (char === '[') {
              bigBracesInCustomSyntax.push({ index: i, token: '[' });
            } else if (char == ']') {
              if (
                bigBracesInCustomSyntax[bigBracesInCustomSyntax.length - 1]
                  .token === '['
              ) {
                bigBracesInCustomSyntax.push({ index: i, token: ']' });
              }
            } else if (char === ':') {
              colonsInCustomSyntax.push({ index: i, token: ':' });
            } else if (char === "!") {
              exclamationInCustomSyntax.push({ index: i, token: "!" })
            }
          }
          
          const componentId = stringToBeTokenized.slice(
            3,
            whiteSpacesInCustomSyntax[0] !== undefined  ?
            whiteSpacesInCustomSyntax[0].index :
            exclamationInCustomSyntax[ exclamationInCustomSyntax.length - 1 ].index,
            );
            variablesInCustomSyntax = this.getAllVariablesInSyntax(
              stringToBeTokenized,
              bigBracesInCustomSyntax,
              );
              
          // find component in database here with id of it
          try {
            const component = await this.prisma.customComponent.findUnique({
              where: {
                componentId: componentId
              }
            })
          } catch (error) {
            console.log(error)
          }

          
          // console.log(colonsInCustomSyntax)
          whiteSpacesInCustomSyntax = [];
          bigBracesInCustomSyntax = [];
          colonsInCustomSyntax = [];
          exclamationInCustomSyntax = [];
        });
      }
    });
  }
}
