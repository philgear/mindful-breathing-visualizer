const vscode = require('vscode');

let statusBarItem;
let intervalId;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Mindful Breathing is now active!');

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    context.subscriptions.push(statusBarItem);

    // Default to Box
    // SECURITY: Inputs are strictly typed command IDs or selection strings, no user-generated code execution.
    startBreathing('box');
    statusBarItem.show();

    context.subscriptions.push(vscode.commands.registerCommand('mindful-breathing.box', () => startBreathing('box')));
    context.subscriptions.push(vscode.commands.registerCommand('mindful-breathing.diaphragmatic', () => startBreathing('diaphragmatic')));
    context.subscriptions.push(vscode.commands.registerCommand('mindful-breathing.alternate', () => startBreathing('alternate')));

    // Command picker
    context.subscriptions.push(vscode.commands.registerCommand('mindful-breathing.select', async () => {
        const choice = await vscode.window.showQuickPick(['Box Breathing', 'Diaphragmatic Breathing', 'Alternate Nostril Breathing']);
        if (choice === 'Box Breathing') startBreathing('box');
        if (choice === 'Diaphragmatic Breathing') startBreathing('diaphragmatic');
        if (choice === 'Alternate Nostril Breathing') startBreathing('alternate');
    }));
    // Shape picker
    context.subscriptions.push(vscode.commands.registerCommand('mindful-breathing.selectShape', async () => {
        const choice = await vscode.window.showQuickPick(['Circle', 'Square', 'Lotus']);
        if (choice) setShape(choice.toLowerCase());
    }));
}

let currentShape = 'circle';

function setShape(shape) {
    currentShape = shape;
    // Restart current technique to apply new icons immediate if running? 
    // Simplified: Just update global config, next tick uses it.
}

function getIcon(phaseName) {
    // Map phase name + shape to icon
    const isHold = phaseName.includes("Hold");

    if (currentShape === 'square') {
        if (isHold) return "$(primitive-square)";
        return "$(primitive-square-outlined)"; // Assuming valid codicon
    } else if (currentShape === 'lotus') {
        if (isHold) return "$(heart)"; // Lotus approximation
        return "$(heart-filled)";
    } else {
        // Circle (Default)
        if (isHold) return "$(circle-filled)";
        return "$(circle-outline)";
    }
}

function startBreathing(technique = 'box') {
    if (intervalId) clearTimeout(intervalId);

    const techniques = {
        box: [
            { name: "Inhale", color: "#34d399", duration: 4000 },
            { name: "Hold", color: "#60a5fa", duration: 4000 },
            { name: "Exhale", color: "#fb7185", duration: 4000 },
            { name: "Hold", color: "#60a5fa", duration: 4000 },
        ],
        diaphragmatic: [
            { name: "Inhale", color: "#34d399", duration: 5000 },
            { name: "Exhale", color: "#fb7185", duration: 5000 },
        ],
        alternate: [
            { name: "Inhale Left", color: "#34d399", duration: 4000 },
            { name: "Hold", color: "#60a5fa", duration: 4000 },
            { name: "Exhale Right", color: "#fb7185", duration: 4000 },
            { name: "Hold", color: "#60a5fa", duration: 4000 },
            { name: "Inhale Right", color: "#34d399", duration: 4000 },
            { name: "Hold", color: "#60a5fa", duration: 4000 },
            { name: "Exhale Left", color: "#fb7185", duration: 4000 },
            { name: "Hold", color: "#60a5fa", duration: 4000 },
        ]
    };

    const phases = techniques[technique] || techniques['box'];
    let phaseIndex = 0;

    const tick = () => {
        const phase = phases[phaseIndex];
        const icon = getIcon(phase.name);

        statusBarItem.text = `${icon} ${phase.name}`;
        statusBarItem.color = phase.color;
        statusBarItem.tooltip = "Mindful Breathing: " + phase.name;

        intervalId = setTimeout(() => {
            phaseIndex = (phaseIndex + 1) % phases.length;
            tick();
        }, phase.duration);
    };

    tick();
}


function deactivate() {
    if (intervalId) clearInterval(intervalId);
}

module.exports = {
    activate,
    deactivate
}
