import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    user-select: none;
  }

  html,
  body,
  #app {
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: transparent;
    font-family: 'Oswald', sans-serif;
  }

  input::-webkit-inner-spin-button,
  input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }
`;

export default GlobalStyle;
