(function(){
  "use strict";
  var doc=document, body=doc.body;
  function store(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v);}catch(e){return null;} }
  function $(s,r){ return (r||doc).querySelector(s); }
  function $$(s,r){ return Array.prototype.slice.call((r||doc).querySelectorAll(s)); }
  function el(h){ var d=doc.createElement("div"); d.innerHTML=h.trim(); return d.firstChild; }

  /* ---- rail: current chapter ---- */
  var links=$$("nav.rail a");
  if("IntersectionObserver" in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ links.forEach(function(a){ a.removeAttribute("aria-current"); if(a.getAttribute("href")==="#"+e.target.id) a.setAttribute("aria-current","true"); }); } });
    },{rootMargin:"-30% 0px -60% 0px"});
    $$("main section").forEach(function(s){ io.observe(s); });
  }

  /* ---- topbar tools: example view + checklist progress ---- */
  var tb=$(".topbar .in");
  var tools=el('<div class="tools"><div><span class="seg-label" id="vlab" style="position:absolute;left:-9999px">Show examples</span><div class="seg" role="group" aria-labelledby="vlab">'+
    '<button data-view="both" aria-pressed="true">Both</button><button data-view="financial" aria-pressed="false">Investing</button><button data-view="airline" aria-pressed="false">Airline</button></div></div>'+
    '<div class="prog" aria-live="polite"><span id="progtxt">0 of 0 checks</span><span class="bar" aria-hidden="true"><i id="progbar"></i></span><button type="button" id="progreset">Reset</button></div></div>');
  tb.appendChild(tools);
  var viewBtns=$$("button[data-view]",tools);
  function setView(v){
    body.setAttribute("data-view",v);
    if(v!=="both") body.setAttribute("data-industry",v);
    viewBtns.forEach(function(b){ b.setAttribute("aria-pressed", b.getAttribute("data-view")===v); });
    store("imp-view",v);
    if(window.__syncTools) window.__syncTools(v);
  }
  viewBtns.forEach(function(b){ b.addEventListener("click",function(){ setView(b.getAttribute("data-view")); }); });

  /* ---- tickable quality checks ---- */
  var items=$$("ul.check li");
  var saved={}; try{ saved=JSON.parse(store("imp-checks")||"{}"); }catch(e){}
  items.forEach(function(li,i){
    li.setAttribute("role","checkbox"); li.setAttribute("tabindex","0");
    li.setAttribute("aria-checked", saved[i]?"true":"false");
    function tog(){ li.setAttribute("aria-checked", li.getAttribute("aria-checked")==="true"?"false":"true"); persist(); }
    li.addEventListener("click",tog);
    li.addEventListener("keydown",function(e){ if(e.key===" "||e.key==="Enter"){ e.preventDefault(); tog(); } });
  });
  var secs=$$("main section").filter(function(s){ return $("ul.check",s); });
  secs.forEach(function(s){ var h=$("h2",s); if(h){ var sp=doc.createElement("span"); sp.className="sec-prog"; h.appendChild(sp); s._sp=sp; } });
  function persist(){
    var o={}, done=0;
    items.forEach(function(li,i){ if(li.getAttribute("aria-checked")==="true"){ o[i]=1; done++; } });
    store("imp-checks",JSON.stringify(o));
    $("#progtxt").textContent=done+" of "+items.length+" checks";
    $("#progbar").style.width=(items.length?100*done/items.length:0)+"%";
    secs.forEach(function(s){ var l=$$("ul.check li",s), d=l.filter(function(x){return x.getAttribute("aria-checked")==="true";}).length; if(s._sp) s._sp.textContent=d+"/"+l.length+" checks"; });
  }
  $("#progreset").addEventListener("click",function(){ items.forEach(function(li){ li.setAttribute("aria-checked","false"); }); persist(); });
  persist();

  /* ---- calculators ---- */
  var PRE={
    financial:{cur:"₹",loc:"en-IN",unit:"₹ Cr",total:90,
      alloc:[["Brand",25],["Performance",30],["Content and owned",10],["CRM and lifecycle",10],["Partnerships and events",10],["Research and measurement",5],["Data and technology",5],["Reserve",5]],
      f:{spend:60000000,cost:450,r1:.20,r2:.20,l0:"Cost per lead (₹)",l1:"Lead to account",l2:"Account to first trade",o:"first-trade customers",c:"cost per first-trade customer",
         sc:[["Today",60000000,450,.20,.20],["+40%, unchanged",84000000,470,.17,.17],["+40%, optimised",84000000,560,.24,.22]]}},
    airline:{cur:"$",loc:"en-US",unit:"$M",total:40,
      alloc:[["Brand",20],["Performance",28],["Content and owned",10],["CRM and lifecycle",12],["Partnerships and field",12],["Research and measurement",5],["Data and technology",6],["Reserve",7]],
      f:{spend:4000000,cost:2,r1:.12,r2:.25,l0:"Cost per visit ($)",l1:"Visit to booking started",l2:"Started to completed",o:"bookings",c:"cost per booking",
         sc:[["Today",4000000,2,.12,.25],["+40%, unchanged",5600000,2.4,.11,.22],["+40%, optimised",5600000,2.9,.15,.27]]}}
  };
  function fmt(n,loc,d){ return n.toLocaleString(loc,{maximumFractionDigits:d||0}); }
  function indSeg(id,cb){
    var s=el('<div class="seg" role="group" aria-label="Business"><button data-i="financial" aria-pressed="true">Investing platform</button><button data-i="airline" aria-pressed="false">Airline</button></div>');
    $$("button",s).forEach(function(b){ b.addEventListener("click",function(){ cb(b.getAttribute("data-i")); }); });
    s.set=function(i){ $$("button",s).forEach(function(b){ b.setAttribute("aria-pressed", b.getAttribute("data-i")===i); }); };
    return s;
  }

  // Budget allocator (section 8)
  var s8=$("#s8 .examples");
  if(s8){
    var ind="financial", vals=[];
    var box=el('<div class="tool" id="alloc"><h3>Try it: split your budget</h3><p class="note" style="margin-top:0">Start from the example mix, then move the sliders. Amounts update as you go, and the total should land on 100%.</p><div class="row"><div><span class="seg-label">Start from</span><span id="aseg"></span></div><div><label for="atot">Total budget</label><input type="number" id="atot" min="0" step="any"></div><button type="button" class="btn" id="anorm">Scale to 100%</button></div><div class="al" id="alrows"></div><p class="total" id="atotal" aria-live="polite"></p></div>');
    var seg=indSeg("a",function(i){ load(i); }); $("#aseg",box).appendChild(seg);
    s8.parentNode.insertBefore(box,s8);
    var rows=$("#alrows",box), tot=$("#atot",box);
    function paint(){
      var p=PRE[ind], sum=0;
      vals.forEach(function(v,i){ sum+=v; $("#av"+i,box).textContent=v+"%"; $("#aa"+i,box).textContent=fmt(+tot.value*v/100,p.loc,1)+" "+(p.cur==="₹"?"Cr":"M"); });
      var t=$("#atotal",box); t.textContent="Total "+sum+"%"+(sum===100?" — adds up":" — "+(sum>100?"over":"under")+" by "+Math.abs(sum-100)+" points");
      t.className="total"+(sum===100?"":" bad");
    }
    function load(i){
      ind=i; seg.set(i); var p=PRE[i]; vals=p.alloc.map(function(a){return a[1];}); tot.value=p.total;
      rows.innerHTML=p.alloc.map(function(a,k){ return '<span class="nm">'+a[0]+'</span><input type="range" min="0" max="60" step="1" value="'+a[1]+'" id="ar'+k+'" aria-label="'+a[0]+' share"><span class="v" id="av'+k+'"></span><span class="v" id="aa'+k+'"></span>'; }).join("");
      p.alloc.forEach(function(a,k){ $("#ar"+k,box).addEventListener("input",function(e){ vals[k]=+e.target.value; paint(); }); });
      paint();
    }
    tot.addEventListener("input",paint);
    $("#anorm",box).addEventListener("click",function(){
      var sum=vals.reduce(function(a,b){return a+b;},0); if(!sum) return;
      vals=vals.map(function(v){ return Math.round(v*100/sum); });
      var d=100-vals.reduce(function(a,b){return a+b;},0); vals[vals.indexOf(Math.max.apply(null,vals))]+=d;
      vals.forEach(function(v,k){ $("#ar"+k,box).value=v; }); paint();
    });
    load("financial");
    var prevSync=window.__syncTools;
    window.__syncTools=function(v){ if(v==="financial"||v==="airline") load(v); if(prevSync) prevSync(v); };
  }

  // Funnel calculator (section 9)
  var s9=$("#s9 .examples");
  if(s9){
    var fi="financial", base=null;
    var fb=el('<div class="tool" id="fcalc"><h3>Try it: cost per outcome</h3><p class="note" style="margin-top:0">Pick a scenario or type your own numbers. The cost per outcome turns amber when it is more than 20% above today.</p><div class="row"><div><span class="seg-label">Business</span><span id="fseg"></span></div><div><span class="seg-label">Scenario</span><span id="fsc"></span></div></div><div class="row"><div><label for="fsp">Spend</label><input type="number" id="fsp" min="0" step="any"></div><div><label for="fcc" id="flc"></label><input type="number" id="fcc" min="0" step="any"></div><div><label for="fr1" id="fl1"></label><input type="number" id="fr1" min="0" max="100" step="0.1"></div><div><label for="fr2" id="fl2"></label><input type="number" id="fr2" min="0" max="100" step="0.1"></div></div><div class="kpis" id="fk"></div><p class="verdict" id="fv" aria-live="polite"></p></div>');
    var fs=indSeg("f",function(i){ floadI(i); }); $("#fseg",fb).appendChild(fs);
    s9.parentNode.insertBefore(fb,s9);
    function floadI(i){
      fi=i; fs.set(i); var f=PRE[i].f;
      $("#flc",fb).textContent=f.l0; $("#fl1",fb).textContent=f.l1+" (%)"; $("#fl2",fb).textContent=f.l2+" (%)";
      var sc=$("#fsc",fb); sc.innerHTML="";
      var g=el('<div class="seg" role="group" aria-label="Scenario"></div>');
      f.sc.forEach(function(s,k){ var b=doc.createElement("button"); b.textContent=s[0]; b.setAttribute("aria-pressed",k===0); b.addEventListener("click",function(){ $$("button",g).forEach(function(x){x.setAttribute("aria-pressed","false");}); b.setAttribute("aria-pressed","true"); setIn(s); }); g.appendChild(b); });
      sc.appendChild(g); setIn(f.sc[0]); base=null; calc(true);
    }
    function setIn(s){ $("#fsp",fb).value=s[1]; $("#fcc",fb).value=s[2]; $("#fr1",fb).value=+(s[3]*100).toFixed(1); $("#fr2",fb).value=+(s[4]*100).toFixed(1); calc(s===PRE[fi].f.sc[0]); }
    function calc(isBase){
      var p=PRE[fi], f=p.f, sp=+$("#fsp",fb).value, cc=+$("#fcc",fb).value, r1=+$("#fr1",fb).value/100, r2=+$("#fr2",fb).value/100;
      var n1=cc?sp/cc:0, n2=n1*r1, n3=n2*r2, cost=n3?sp/n3:0;
      if(isBase||base===null) base=cost;
      var d=base?(cost/base-1)*100:0, bad=d>20;
      var k=[[fmt(n1,p.loc),"entering funnel"],[fmt(n2,p.loc),"after stage 1"],[fmt(n3,p.loc),f.o],[p.cur+fmt(cost,p.loc),f.c]];
      $("#fk",fb).innerHTML=k.map(function(x,i){ return '<div class="kpi'+(i===3&&bad?" bad":"")+'"><b>'+x[0]+'</b><small>'+x[1]+'</small></div>'; }).join("");
      var v=$("#fv",fb); v.className="verdict"+(bad?" bad":"");
      v.textContent=isBase||Math.abs(d)<0.5?"This is the baseline. Change an input or pick a scenario to compare.":(bad?"Cost per outcome is "+d.toFixed(0)+"% above today. More spend without a better funnel buys outcomes at a higher price.":(d>0?"Cost per outcome is "+d.toFixed(0)+"% above today, within the 20% tolerance.":"Cost per outcome is "+Math.abs(d).toFixed(0)+"% below today. The funnel improved faster than spend."));
    }
    ["fsp","fcc","fr1","fr2"].forEach(function(id){ $("#"+id,fb).addEventListener("input",function(){ calc(false); }); });
    floadI("financial");
    var p2=window.__syncTools;
    window.__syncTools=function(v){ if(v==="financial"||v==="airline") floadI(v); if(p2) p2(v); };
  }

  setView(store("imp-view")||"both");
})();
