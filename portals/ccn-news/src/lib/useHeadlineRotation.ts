import {useEffect, useState} from 'react';
export function useHeadlineRotation(count: number) {
  const [index,setIndex]=useState(0),[paused,setPaused]=useState(false),[hovered,setHovered]=useState(false),[focused,setFocused]=useState(false);
  const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setReduced(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
  useEffect(()=>{if(count<2 || paused || hovered || focused || reduced)return;const timer=setInterval(()=>setIndex(index=>(index+1)%count),8000);return()=>clearInterval(timer);},[count,paused,hovered,focused,reduced]);
  return {index:count?index%count:0,paused:paused||reduced,toggle:()=>setPaused(value=>!value),previous:()=>setIndex(index=>(index-1+count)%Math.max(count,1)),next:()=>setIndex(index=>(index+1)%Math.max(count,1)),handlers:{onMouseEnter:()=>setHovered(true),onMouseLeave:()=>setHovered(false),onFocus:()=>setFocused(true),onBlur:(event:React.FocusEvent)=>{if(!event.currentTarget.contains(event.relatedTarget))setFocused(false);}}};
}
