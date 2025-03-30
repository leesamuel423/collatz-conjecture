let chart = null;
let currentSequence = [];

document.addEventListener('DOMContentLoaded', () => {
  const calculateBtn = document.getElementById('calculate-btn');
  const resetBtn = document.getElementById('reset-btn');
  const startNumberInput = document.getElementById('start-number');
  const stepsDisplay = document.getElementById('steps');
  const maxValueDisplay = document.getElementById('max-value');
  const ctx = document.getElementById('chart').getContext('2d');
  const scrollTopBtn = document.getElementById('scroll-top');

  // Initialize the chart
  initChart(ctx);

  // Calculate button click handler
  calculateBtn.addEventListener('click', () => {
    const startNumber = parseInt(startNumberInput.value);
    if (isNaN(startNumber) || startNumber < 1) {
      alert('Please enter a valid positive integer');
      return;
    }
    calculateBtn.disabled = true;
    calculateBtn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12c0 1.2-.5 2.3-1 3c-1.4 2-3.8 3-6 3s-4.6-1-6-3c-.5-.7-1-1.8-1-3m0 0c0-1.2.5-2.3 1-3c1.4-2 3.8-3 6-3s4.6 1 6 3c.5.7 1 1.8 1 3"/><path d="M12 9v2l1.5 1.5"/></svg> Calculating...';
    fetchCollatzSequence(startNumber);
  });

  // Reset button click handler
  resetBtn.addEventListener('click', () => {
    resetVisualization();
  });

  // Input validation and auto-calculation on Enter
  startNumberInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      calculateBtn.click();
    }
  });

  // Scroll to top button
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });

  // Initialize with default value (27)
  fetchCollatzSequence(27);
});

function initChart(ctx) {
  Chart.defaults.font.family = '"Inter", system-ui, sans-serif';
  Chart.defaults.color = '#94a3b8';

  // Create gradient for chart
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(129, 140, 248, 0.3)');
  gradient.addColorStop(1, 'rgba(99, 102, 241, 0.02)');

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Collatz Sequence',
          data: [],
          backgroundColor: gradient,
          borderColor: '#818cf8',
          borderWidth: 2.5,
          pointRadius: (context) => {
            // Make points larger at the start, max, and end
            const index = context.dataIndex;
            if (
              index === 0 ||
              (currentSequence.length > 0 &&
                currentSequence[index] === Math.max(...currentSequence)) ||
              index === currentSequence.length - 1
            ) {
              return 6;
            }
            return 2;
          },
          pointBackgroundColor: (context) => {
            // Color special points differently
            const index = context.dataIndex;
            if (index === 0) return '#818cf8'; // Start point
            if (
              currentSequence.length > 0 &&
              currentSequence[index] === Math.max(...currentSequence)
            ) {
              return '#f87171'; // Max value point
            }
            if (index === currentSequence.length - 1) return '#4ade80'; // End point
            return '#818cf8'; // Regular points
          },
          pointBorderColor: (context) => {
            // Border color for special points
            const index = context.dataIndex;
            if (index === 0) return '#6366f1'; // Start point
            if (
              currentSequence.length > 0 &&
              currentSequence[index] === Math.max(...currentSequence)
            ) {
              return '#ef4444'; // Max value point
            }
            if (index === currentSequence.length - 1) return '#16a34a'; // End point
            return '#818cf8'; // Regular points
          },
          pointBorderWidth: 2,
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          grid: {
            color: 'rgba(51, 65, 85, 0.5)',
            drawBorder: false,
          },
          ticks: {
            padding: 10,
            callback: function (value) {
              if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + 'M';
              } else if (value >= 1000) {
                return (value / 1000).toFixed(1) + 'K';
              }
              return value;
            },
          },
          title: {
            display: true,
            text: 'Value',
            font: {
              weight: 'bold',
            },
            padding: { top: 10, bottom: 10 },
          },
        },
        x: {
          grid: {
            color: 'rgba(51, 65, 85, 0.5)',
            drawBorder: false,
          },
          ticks: {
            padding: 10,
          },
          title: {
            display: true,
            text: 'Step',
            font: {
              weight: 'bold',
            },
            padding: { top: 10, bottom: 10 },
          },
        },
      },
      animation: {
        duration: 1500,
        easing: 'easeOutQuart',
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(30, 41, 59, 0.9)',
          titleFont: {
            weight: 'bold',
            size: 14,
          },
          bodyFont: {
            size: 13,
          },
          padding: 12,
          cornerRadius: 8,
          boxPadding: 6,
          borderColor: 'rgba(51, 65, 85, 0.5)',
          borderWidth: 1,
          callbacks: {
            title: function (tooltipItems) {
              return `Step: ${tooltipItems[0].dataIndex}`;
            },
            label: function (context) {
              const value = context.parsed.y;
              let label = `Value: ${formatNumber(value)}`;

              // Add special note for max value
              if (currentSequence.length > 0 && value === Math.max(...currentSequence)) {
                label += ' ⭐ Maximum';
              }
              // Add calculation note
              if (context.dataIndex > 0) {
                const prevValue = currentSequence[context.dataIndex - 1];
                if (prevValue % 2 === 0) {
                  label += `\n${formatNumber(prevValue)} ÷ 2 = ${formatNumber(value)}`;
                } else {
                  label += `\n${formatNumber(prevValue)} × 3 + 1 = ${formatNumber(value)}`;
                }
              }
              return label;
            },
          },
        },
      },
      interaction: {
        mode: 'nearest',
        intersect: false,
        axis: 'x',
      },
    },
  });
}

async function fetchCollatzSequence(startNumber) {
  try {
    const response = await fetch(`/api/collatz?start=${startNumber}`);
    if (!response.ok) {
      throw new Error('Server error');
    }
    const sequence = await response.json();
    currentSequence = sequence; // Store for reference
    updateVisualization(sequence);
  } catch (error) {
    console.error('Error fetching data:', error);
    alert('Error fetching data. Please try again.');
  } finally {
    const calculateBtn = document.getElementById('calculate-btn');
    calculateBtn.disabled = false;
    calculateBtn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg> Calculate';
  }
}

function updateVisualization(sequence) {
  // Update chart
  const labels = sequence.map((_, index) => index);

  chart.data.labels = labels;
  chart.data.datasets[0].data = sequence;
  chart.update();

  // Update stats with animation
  animateValue('steps', 0, sequence.length - 1, 1000);
  animateValue('max-value', 0, Math.max(...sequence), 1500);
}

function resetVisualization() {
  // Clear the chart
  chart.data.labels = [];
  chart.data.datasets[0].data = [];
  chart.update();

  // Reset stats
  document.getElementById('steps').textContent = '0';
  document.getElementById('max-value').textContent = '0';

  // Reset input and current sequence
  document.getElementById('start-number').value = '27';
  currentSequence = [];

  // Provide visual feedback for reset
  const resetBtn = document.getElementById('reset-btn');
  const originalHTML = resetBtn.innerHTML;
  resetBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Reset Complete';
  setTimeout(() => {
    resetBtn.innerHTML = originalHTML;
  }, 1500);

  // Initialize with default value after reset
  setTimeout(() => {
    fetchCollatzSequence(27);
  }, 500);
}

// Helper function to animate counting up for stats
function animateValue(elementId, start, end, duration) {
  const element = document.getElementById(elementId);
  const startTime = performance.now();

  // Handle large numbers by using an appropriate step size
  const range = end - start;
  const step = Math.max(1, Math.floor(range / 100));

  function updateValue(timestamp) {
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Use easeOutQuart for smoother animation
    const easeProgress = 1 - Math.pow(1 - progress, 4);

    const currentValue = Math.floor(start + range * easeProgress);
    element.textContent = formatNumber(currentValue);

    if (progress < 1) {
      requestAnimationFrame(updateValue);
    } else {
      element.textContent = formatNumber(end);
    }
  }

  requestAnimationFrame(updateValue);
}

// Format large numbers with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
