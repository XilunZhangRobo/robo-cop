"use strict";
(() => {
const examples=[{"turn": 0, "instruction": "pick up the coffee cup", "keep": true, "reason": "The robot successfully grasps the coffee cup and lifts it off the table.", "stage_a_verdict": "OK", "stage_a_reason": "The code opens the gripper, approaches, grasps, checks aperture successfully, and lifts the coffee cup as confirmed by the judge's assessment noting the robot held the cup.", "stage_b_verdict": "SUCCESS", "segment_indices": [0, 1, 2, 3, 4], "episode": "RecycleCupClutterRandomizedTask_t07_0909_121936_p1794437", "trial": 7, "kind": "Scripted code", "file": "curation-scripted-keep", "label": "Scripted \u00b7 kept", "calls": "open_gripper \u2192 goto_pregrasp \u2192 goto_pose \u2192 close_gripper \u2192 goto_pose"}, {"turn": 0, "instruction": "pick up the coffee cup", "keep": false, "reason": "The robot knocked over the green bin and banana while attempting the action, and the coffee cup is glitching through the cream bin.", "stage_a_verdict": "OK", "stage_a_reason": "The gripper opens, approaches the coffee cup via pregrasp, descends, grasps, and lifts vertically, successfully picking it up.", "stage_b_verdict": "FAILED", "segment_indices": [0, 1, 2, 3, 4], "episode": "RecycleCupClutterRandomizedTask_t02_0909_114741_p1794437", "trial": 2, "kind": "Scripted code", "file": "curation-scripted-reject", "label": "Scripted \u00b7 rejected", "calls": "open_gripper \u2192 goto_pregrasp \u2192 goto_pose \u2192 close_gripper \u2192 goto_pose"}, {"turn": 9, "instruction": "move the gripper up and away from the beige container", "keep": false, "reason": "Instead of moving up and away from the beige container, the gripper moves downward and stays directly at the rim of the container.", "stage_a_verdict": "FAILED", "stage_a_reason": "The visual judge observed 'the gripper remains right at the bin's rim while the coffee cup is pinned or hanging from the opposite rim'.", "stage_b_verdict": "FAILED", "episode": "RecycleCupClutterRandomizedTask_t02_0909_114741_p1794437", "trial": 2, "kind": "VLA", "file": "curation-vla-reject", "label": "VLA \u00b7 rejected", "calls": "execute_vla(\"move the gripper up and away from the beige container\", max_steps=2700)"}];

const video=document.getElementById('curation-video');
const el=id=>document.getElementById('curation-'+id);
let selected=0;
function reveal(){
 const r=examples[selected];
 el('video-verdict').textContent=r.stage_b_verdict;
 el('video-reason').textContent=r.reason;
 el('final').textContent=r.keep?'KEEP — included in training data':'REJECT — excluded from training data';
 el('final').className=r.keep?'curation-keep':'curation-reject';
 el('reveal').hidden=true;
}
function select(i){
 video.pause();selected=i;const r=examples[i];
 document.querySelectorAll('[data-curation]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.curation)===i)));
 el('source').textContent=`Cup recycling · Trial ${r.trial} · Turn ${r.turn} · ${r.kind}`;
 el('instruction').textContent=r.instruction;
 el('calls').textContent=r.calls;
 el('text-verdict').textContent=r.stage_a_verdict;
 el('text-reason').textContent=r.stage_a_reason;
 el('video-verdict').textContent='';
 el('video-reason').textContent='Play the segment to reveal the recorded video judgment.';
 el('final').textContent='Awaiting video review';el('final').className='';el('reveal').hidden=false;
 video.poster=`assets/${r.file}.jpg`;video.src=`assets/${r.file}.mp4`;video.load();
}
video.addEventListener('ended',reveal);
el('reveal').addEventListener('click',reveal);
document.querySelectorAll('[data-curation]').forEach(b=>b.addEventListener('click',()=>select(Number(b.dataset.curation))));
select(0);
})();
