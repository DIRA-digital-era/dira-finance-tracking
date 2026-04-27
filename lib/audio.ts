// Play success sound effect using Web Audio API
export function playSuccessSound() {
  try {
    // Create audio context and oscillator for success tone
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Configure oscillator for pleasant success sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime); // A4 note
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // Octave jump for ping effect
    
    // Configure volume envelope
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    // Connect and play sound
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.log('Audio disabled or unsupported');
  }
}

// Play error sound effect using Web Audio API
export function playErrorSound() {
  try {
    // Create audio context and oscillator for error tone
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Configure oscillator for harsh error sound
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, ctx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2); // Pitch down for error feel
    
    // Configure volume envelope
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    // Connect and play sound
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.log('Audio disabled or unsupported');
  }
}
