import { ParallelCoordinatesPlot, mountParallelCoordinatesPlot } from './src/parallelCoordiantesChart';
import './style.css';

document.querySelector('#app').innerHTML = `
  <div id='main-container' class='d-flex'>
      ${ParallelCoordinatesPlot()}
  </div>
`;


mountParallelCoordinatesPlot();