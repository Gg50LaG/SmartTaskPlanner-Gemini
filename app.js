// --- UI Element References ---
const goalInput = document.getElementById('goalInput');
const timelineInput = document.getElementById('timelineInput');
const generateButton = document.getElementById('generateButton');
const statusMessage = document.getElementById('statusMessage');
const outputCard = document.getElementById('outputCard');
const planTitle = document.getElementById('planTitle');
const planContainer = document.getElementById('planContainer');
const errorMessageDiv = document.getElementById('errorMessage');

// --- UI Helper Functions ---

function showLoading(message) {
    outputCard.classList.add('hidden');
    errorMessageDiv.classList.add('hidden');
    generateButton.disabled = true;
    generateButton.classList.add('bg-gray-400', 'hover:bg-gray-400');
    generateButton.classList.remove('bg-primary-blue', 'hover:bg-emerald-600', 'hover:scale-[1.01]');

    statusMessage.textContent = message;
    statusMessage.classList.remove('hidden');
    statusMessage.classList.add('text-primary-blue');
    document.getElementById('buttonIcon').innerHTML = `<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;
    document.getElementById('buttonText').textContent = 'Generating...';
}

function hideLoading() {
    generateButton.disabled = false;
    generateButton.classList.remove('bg-gray-400', 'hover:bg-gray-400');
    generateButton.classList.add('bg-primary-blue', 'hover:bg-emerald-600', 'hover:scale-[1.01]');
    statusMessage.classList.add('hidden');
    document.getElementById('buttonIcon').innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>`;
    document.getElementById('buttonText').textContent = 'Generate Project Plan';
}

function showError(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.classList.remove('hidden');
    outputCard.classList.remove('hidden');
}

/**
 * Renders the task plan into the DOM.
 * @param {object} plan The parsed JSON plan object.
 */
function displayPlan(plan) {
    planTitle.textContent = plan.title;
    planContainer.innerHTML = ''; // Clear previous content
    errorMessageDiv.classList.add('hidden');
    outputCard.classList.remove('hidden');
    
    plan.tasks.forEach(task => {
        const dependenciesText = task.dependencyIds && task.dependencyIds.length > 0 
            ? `Requires: Task ${task.dependencyIds.join(', ')}` 
            : 'No Dependencies';

        const taskElement = document.createElement('div');
        taskElement.id = `task-${task.id}`;
        taskElement.className = 'relative flex items-start p-4 mb-4 bg-secondary-gray rounded-xl transition duration-200 hover:bg-gray-200';
        
        // Dependency Visual Indicator (Basic)
        const dependencyMarker = task.dependencyIds && task.dependencyIds.length > 0 ? 
            `<div class="h-full w-1 absolute left-0 top-0 rounded-l-lg bg-red-400" title="Dependency Exists"></div>` : 
            `<div class="h-full w-1 absolute left-0 top-0 rounded-l-lg bg-primary-blue" title="Start Task"></div>`;


        // Render dependencies visually as tags
        const depTags = task.dependencyIds.map(depId => 
            `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                &#x2190; T${depId}
            </span>`
        ).join('');

        taskElement.innerHTML = `
            ${dependencyMarker}
            <div class="ml-4 flex-1">
                <div class="flex justify-between items-start">
                    <h3 class="text-lg font-semibold text-dark-gray">Task ${task.id}: ${task.description}</h3>
                </div>
                <div class="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                    <span class="font-bold text-primary-blue bg-green-100 px-3 py-1 rounded-full">
                        <span class="text-xs font-normal text-gray-500 mr-1">Duration:</span> ${task.durationDays} days
                    </span>
                    <span class="font-bold text-dark-gray bg-yellow-100 px-3 py-1 rounded-full">
                        <span class="text-xs font-normal text-gray-500 mr-1">Complete By:</span> ${task.estimatedCompletionDate}
                    </span>
                </div>
                ${depTags ? `<div class="mt-2 text-xs text-gray-500 space-x-2">${depTags}</div>` : ''}
            </div>
        `;
        planContainer.appendChild(taskElement);
    });
}


// --- Main Event Handler ---

async function handleGeneration() {
    const goal = goalInput.value.trim();
    const timeline = timelineInput.value.trim();

    if (!goal || !timeline) {
        showError("Please enter both a project goal and a target timeline.");
        return;
    }
    
    try {
        showLoading("Thinking like a Project Manager...");
        
        // Call the backend API endpoint
        const response = await fetch('/generate-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ goal, timeline })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server failed with status: ${response.status}`);
        }

        const plan = await response.json();
        
        if (!plan || !plan.tasks || plan.tasks.length === 0) {
            throw new Error("The AI generated an invalid or empty plan structure.");
        }

        displayPlan(plan);

    } catch (error) {
        console.error("Critical error during plan generation:", error);
        showError(`Failed to generate plan. Please try again. Error: ${error.message.substring(0, 150)}...`);
    } finally {
        hideLoading();
    }
}


// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // Set default values for convenience
    goalInput.value = "Create a minimum viable product (MVP) for a subscription box service.";
    timelineInput.value = "in 4 weeks";
    
    // Attach the event listener
    generateButton.addEventListener('click', handleGeneration);
});