import{t as e}from"./check-DheZo3fR.js";import{t}from"./rotate-ccw-CniKYPgw.js";import{t as n}from"./target-DCPLUbrQ.js";import{C as r,D as i,S as a,_ as o,b as s,d as c,h as l,m as u,o as d,w as f}from"./index-BOVoUyi7.js";var p=i(f(),1),m=a(),h=`https://ai-career-mentor-m2id.onrender.com`,g=()=>{let i=r(),[a,f]=(0,p.useState)(0),[g,_]=(0,p.useState)({}),[v,y]=(0,p.useState)(!1),[b,x]=(0,p.useState)([]),[S,C]=(0,p.useState)(!1),[w,T]=(0,p.useState)(``),[E,D]=(0,p.useState)(null),O=[{id:`education`,type:`select`,question:`What is your education level?`,options:[`High School`,`Diploma`,`Bachelor's`,`Master's`]},{id:`experience_level`,type:`select`,question:`What is your experience level?`,options:[`Beginner`,`Intermediate`,`Advanced`]},{id:`python`,type:`skill`,question:`Do you have experience with Python programming?`,options:[`Yes, I have experience`,`No, not yet`]},{id:`sql`,type:`skill`,question:`Do you have experience with SQL / databases?`,options:[`Yes, I have experience`,`No, not yet`]},{id:`excel`,type:`skill`,question:`Do you have experience with Excel / spreadsheets?`,options:[`Yes, I have experience`,`No, not yet`]},{id:`statistics`,type:`skill`,question:`Do you have experience with statistics / data math?`,options:[`Yes, I have experience`,`No, not yet`]},{id:`communication`,type:`skill`,question:`Do you consider communication one of your strengths?`,options:[`Yes, I have experience`,`No, not yet`]},{id:`problem_solving`,type:`skill`,question:`Do you enjoy solving complex problems?`,options:[`Yes, I have experience`,`No, not yet`]},{id:`web_development`,type:`skill`,question:`Do you have experience with web development (HTML/CSS/JS)?`,options:[`Yes, I have experience`,`No, not yet`]},{id:`data_interest`,type:`interest`,question:`Are you interested in working with data and analytics?`,options:[`Yes, very interested`,`Not really`]},{id:`ai_interest`,type:`interest`,question:`Are you interested in AI / Machine Learning?`,options:[`Yes, very interested`,`Not really`]},{id:`cloud_interest`,type:`interest`,question:`Are you interested in cloud computing / DevOps?`,options:[`Yes, very interested`,`Not really`]},{id:`design_interest`,type:`interest`,question:`Are you interested in UI/UX design?`,options:[`Yes, very interested`,`Not really`]},{id:`environment`,type:`bonus`,question:`What work environment do you prefer?`,options:[`Remote`,`Office`,`Hybrid`,`Flexible`]},{id:`priority`,type:`bonus`,question:`What is your career priority?`,options:[`High Salary`,`Work-life Balance`,`Growth`,`Impact`]},{id:`team_role`,type:`bonus`,question:`How do you prefer to work?`,options:[`Independently`,`In a team`,`Leading a team`,`Mix of both`]},{id:`learning_style`,type:`bonus`,question:`How do you prefer to learn new skills?`,options:[`Videos`,`Reading docs`,`Hands-on projects`,`Mentorship`]}],k=e=>{let t=O[a].id;_(n=>({...n,[t]:e}))},A=()=>localStorage.getItem(`ra_token`)||localStorage.getItem(`ai-nexus-token`)||localStorage.getItem(`token`)||``,j=e=>{switch(e){case`High School`:return`high_school`;case`Diploma`:return`diploma`;case`Bachelor's`:return`bachelors`;case`Master's`:return`masters`;default:return`bachelors`}},M=e=>{switch(e){case`Beginner`:return`beginner`;case`Intermediate`:return`intermediate`;case`Advanced`:return`advanced`;default:return`beginner`}},N=e=>e===`Yes, I have experience`||e===`Yes, very interested`,P=()=>O.filter(e=>e.type===`skill`).filter(e=>N(g[e.id])).map(e=>e.id),F=()=>O.filter(e=>e.type===`interest`).filter(e=>N(g[e.id])).map(e=>e.id),I=async()=>{C(!0),T(``);try{let e=A();if(!e)throw Error(`Authentication token not found. Please login again.`);let t={skills:P(),interests:F(),experience_level:M(g.experience_level),education:j(g.education)},n=await fetch(`${h}/api/v1/career/predict`,{method:`POST`,headers:{Accept:`application/json`,"Content-Type":`application/json`,Authorization:`Bearer ${e}`},body:JSON.stringify(t)}),r=await n.json();if(!n.ok)throw Error(r?.detail||r?.message||`Career prediction failed`);if(!r.success)throw Error(r?.message||`Career recommendations could not be generated`);x(r.data||[]),y(!0)}catch(e){T(e.message||`Something went wrong`)}finally{C(!1)}},L=async()=>{let e=O[a];if(!g[e.id]){T(`Please select an option before continuing.`);return}T(``),a<O.length-1?f(a+1):await I()},R=()=>{a>0&&(f(a-1),T(``))},z=()=>{f(0),_({}),x([]),y(!1),T(``)},B=async e=>{D(e),T(``);try{let t=A(),n=await fetch(`${h}/api/v1/career/select/${e}`,{method:`POST`,headers:{Authorization:`Bearer ${t}`}}),r=await n.json();n.ok&&r.success?i(`/my-career`):T(r.detail||`Failed to select career`)}catch{T(`Failed to select career`)}finally{D(null)}},V=(a+1)/O.length*100;return(0,m.jsx)(`div`,{className:`min-h-screen bg-[#F6F1E8] px-4 py-6 text-[#173B32] md:px-8 md:py-8`,children:v?(0,m.jsxs)(`div`,{className:`mx-auto max-w-6xl`,children:[(0,m.jsxs)(`div`,{className:`mb-8 flex flex-col justify-between gap-5 border-b border-[#DED8CC] pb-8 md:flex-row md:items-end`,children:[(0,m.jsxs)(`div`,{children:[(0,m.jsxs)(`div`,{className:`mb-4 flex items-center gap-2`,children:[(0,m.jsx)(`div`,{className:`flex h-9 w-9 items-center justify-center rounded-lg bg-[#78927A]/15`,children:(0,m.jsx)(u,{className:`h-4 w-4 text-[#78927A]`})}),(0,m.jsx)(`span`,{className:`text-[11px] font-semibold uppercase tracking-[0.2em] text-[#78927A]`,children:`Assessment Complete`})]}),(0,m.jsxs)(`h1`,{className:`text-3xl font-bold tracking-tight text-[#173B32] md:text-5xl`,children:[`Your`,` `,(0,m.jsx)(`span`,{className:`text-[#D66A4A]`,children:`Career Matches`})]}),(0,m.jsx)(`p`,{className:`mt-3 text-sm text-[#66736B] md:text-base`,children:`AI-powered recommendations based on your responses.`})]}),(0,m.jsxs)(`button`,{onClick:z,className:`\r
                flex items-center justify-center gap-2\r
                rounded-xl\r
                border border-[#173B32]\r
                bg-[#FFFDF8]\r
                px-5 py-3\r
                text-sm font-semibold\r
                text-[#173B32]\r
                transition-colors\r
                hover:bg-[#173B32]/5\r
              `,children:[(0,m.jsx)(t,{className:`h-4 w-4`}),`Take Again`]})]}),w&&(0,m.jsx)(`div`,{className:`mb-6 rounded-xl border border-[#B94F35]/30 bg-[#B94F35]/10 px-5 py-4 text-sm text-[#B94F35]`,children:w}),(0,m.jsx)(`div`,{className:`space-y-5`,children:b.length===0?(0,m.jsxs)(`div`,{className:`rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-12 text-center shadow-[0_1px_4px_rgba(23,59,50,0.06)]`,children:[(0,m.jsx)(o,{className:`mx-auto mb-4 h-10 w-10 text-[#8A948D]`}),(0,m.jsx)(`p`,{className:`text-sm text-[#66736B]`,children:`No career recommendations found.`})]}):b.map((t,n)=>{let r=t.career,i=Math.round(t.match_score||t.score||0),a=i/100*314;return(0,m.jsx)(`div`,{className:`\r
                      group relative overflow-hidden\r
                      rounded-2xl\r
                      border border-[#DED8CC]\r
                      bg-[#FFFDF8]\r
                      p-5\r
                      shadow-[0_1px_4px_rgba(23,59,50,0.06)]\r
                      transition-all duration-300\r
                      hover:shadow-[0_8px_22px_rgba(23,59,50,0.12)]\r
                      md:p-7\r
                    `,children:(0,m.jsxs)(`div`,{className:`relative flex flex-col gap-8 lg:flex-row`,children:[(0,m.jsxs)(`div`,{className:`min-w-0 flex-1`,children:[(0,m.jsxs)(`div`,{className:`mb-4 flex items-start gap-3`,children:[(0,m.jsxs)(`span`,{className:`flex h-9 min-w-9 items-center justify-center rounded-lg bg-[#173B32] px-2 text-xs font-bold text-[#E4B84A]`,children:[`#`,t.rank||n+1]}),(0,m.jsxs)(`div`,{children:[(0,m.jsx)(`h3`,{className:`text-xl font-bold text-[#173B32] md:text-2xl`,children:r.title}),(0,m.jsxs)(`div`,{className:`mt-2 flex flex-wrap gap-2`,children:[(0,m.jsx)(`span`,{className:`rounded-full border border-[#DED8CC] bg-[#F6F1E8] px-3 py-1 text-[11px] text-[#66736B]`,children:r.category}),(0,m.jsx)(`span`,{className:`rounded-full border border-[#DED8CC] bg-[#F6F1E8] px-3 py-1 text-[11px] text-[#66736B]`,children:r.difficulty}),(0,m.jsxs)(`span`,{className:`rounded-full border border-[#DED8CC] bg-[#F6F1E8] px-3 py-1 text-[11px] text-[#66736B]`,children:[r.average_learning_time,`h learning`]})]})]})]}),(0,m.jsx)(`p`,{className:`mb-6 max-w-3xl text-sm leading-6 text-[#66736B]`,children:r.description}),(0,m.jsxs)(`div`,{className:`grid gap-5 md:grid-cols-2`,children:[t.matched_skills?.length>0&&(0,m.jsxs)(`div`,{children:[(0,m.jsx)(`p`,{className:`mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#78927A]`,children:`Matched Skills`}),(0,m.jsx)(`div`,{className:`flex flex-wrap gap-2`,children:t.matched_skills.map((e,t)=>(0,m.jsxs)(`span`,{className:`\r
                                      rounded-lg\r
                                      border border-[#78927A]/40\r
                                      bg-[#78927A]/15\r
                                      px-3 py-1.5\r
                                      text-[11px]\r
                                      font-medium\r
                                      text-[#173B32]\r
                                    `,children:[`✓ `,e]},t))})]}),t.missing_skills?.length>0&&(0,m.jsxs)(`div`,{children:[(0,m.jsx)(`p`,{className:`mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#B94F35]`,children:`Skills to Improve`}),(0,m.jsx)(`div`,{className:`flex flex-wrap gap-2`,children:t.missing_skills.map((e,t)=>(0,m.jsxs)(`span`,{className:`\r
                                      rounded-lg\r
                                      border border-[#D66A4A]/30\r
                                      bg-[#D66A4A]/10\r
                                      px-3 py-1.5\r
                                      text-[11px]\r
                                      font-medium\r
                                      text-[#B94F35]\r
                                    `,children:[`+ `,e]},t))})]})]}),t.reasons?.length>0&&(0,m.jsx)(`div`,{className:`mt-6 space-y-2`,children:t.reasons.map((t,n)=>(0,m.jsxs)(`div`,{className:`flex items-start gap-2 text-xs text-[#66736B]`,children:[(0,m.jsx)(e,{className:`mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#78927A]`}),(0,m.jsx)(`span`,{children:t})]},n))}),(0,m.jsxs)(`button`,{onClick:()=>B(r.id),disabled:E===r.id,className:`\r
                            mt-7 flex w-full items-center justify-center gap-2\r
                            rounded-xl\r
                            bg-[#173B32]\r
                            px-5 py-3\r
                            text-sm font-semibold\r
                            text-[#FFFDF8]\r
                            transition-colors\r
                            hover:bg-[#1F4A3F]\r
                            disabled:opacity-60\r
                          `,children:[E===r.id?`Selecting...`:`This is what I want`,E!==r.id&&(0,m.jsx)(s,{className:`h-4 w-4`})]})]}),(0,m.jsx)(`div`,{className:`flex flex-shrink-0 items-center justify-center lg:w-40`,children:(0,m.jsxs)(`div`,{className:`relative h-32 w-32`,children:[(0,m.jsxs)(`svg`,{className:`h-32 w-32 -rotate-90`,viewBox:`0 0 112 112`,children:[(0,m.jsx)(`circle`,{cx:`56`,cy:`56`,r:`50`,fill:`none`,stroke:`currentColor`,strokeWidth:`5`,className:`text-[#DED8CC]`}),(0,m.jsx)(`circle`,{cx:`56`,cy:`56`,r:`50`,fill:`none`,stroke:`currentColor`,strokeWidth:`5`,strokeLinecap:`round`,strokeDasharray:`${a} 314`,className:`text-[#D66A4A]`})]}),(0,m.jsx)(`div`,{className:`absolute inset-0 flex items-center justify-center`,children:(0,m.jsxs)(`div`,{className:`text-center`,children:[(0,m.jsx)(`span`,{className:`text-3xl font-bold text-[#173B32]`,children:i}),(0,m.jsx)(`span`,{className:`text-sm text-[#66736B]`,children:`%`}),(0,m.jsx)(`p`,{className:`mt-0.5 text-[10px] uppercase tracking-[0.12em] text-[#8A948D]`,children:`Match`})]})})]})})]})},r.id||n)})}),(0,m.jsxs)(`button`,{onClick:z,className:`\r
              mt-6 flex w-full items-center justify-center gap-2\r
              rounded-xl\r
              border border-[#173B32]\r
              bg-[#FFFDF8]\r
              px-6 py-3.5\r
              text-sm font-semibold\r
              text-[#173B32]\r
              transition-colors\r
              hover:bg-[#173B32]/5\r
            `,children:[(0,m.jsx)(t,{className:`h-4 w-4`}),`Take Assessment Again`]})]}):(0,m.jsxs)(`div`,{className:`mx-auto max-w-4xl`,children:[(0,m.jsxs)(`div`,{className:`mb-8 flex items-start justify-between gap-6 border-b border-[#DED8CC] pb-8`,children:[(0,m.jsxs)(`div`,{children:[(0,m.jsxs)(`div`,{className:`mb-4 flex items-center gap-2`,children:[(0,m.jsx)(`div`,{className:`flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4B84A]/40 bg-[#E4B84A]/20`,children:(0,m.jsx)(d,{className:`h-4 w-4 text-[#173B32]`})}),(0,m.jsx)(`span`,{className:`text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D66A4A]`,children:`Career Intelligence`})]}),(0,m.jsxs)(`h1`,{className:`text-3xl font-bold tracking-tight text-[#173B32] md:text-5xl`,children:[`Discover Your`,` `,(0,m.jsx)(`span`,{className:`text-[#D66A4A]`,children:`Career Path`})]}),(0,m.jsx)(`p`,{className:`mt-3 max-w-2xl text-sm leading-6 text-[#66736B] md:text-base`,children:`Answer a few questions and let AI identify the career paths that best match your skills, interests and goals.`})]}),(0,m.jsxs)(`div`,{className:`hidden rounded-xl border border-[#DED8CC] bg-[#FFFDF8] px-4 py-3 text-right shadow-[0_1px_4px_rgba(23,59,50,0.06)] md:block`,children:[(0,m.jsx)(`p`,{className:`text-[10px] uppercase tracking-[0.15em] text-[#8A948D]`,children:`Assessment`}),(0,m.jsx)(`p`,{className:`mt-1 text-sm font-semibold text-[#173B32]`,children:`AI Powered`})]})]}),(0,m.jsxs)(`div`,{className:`mb-6 rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-4 shadow-[0_1px_4px_rgba(23,59,50,0.06)]`,children:[(0,m.jsxs)(`div`,{className:`mb-3 flex items-center justify-between`,children:[(0,m.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,m.jsx)(n,{className:`h-4 w-4 text-[#D66A4A]`}),(0,m.jsxs)(`span`,{className:`text-xs font-medium text-[#66736B]`,children:[`Question `,a+1,` of `,O.length]})]}),(0,m.jsxs)(`span`,{className:`text-xs font-bold text-[#173B32]`,children:[Math.round(V),`%`]})]}),(0,m.jsx)(`div`,{className:`h-2 overflow-hidden rounded-full bg-[#DED8CC]`,children:(0,m.jsx)(`div`,{className:`h-full rounded-full bg-[#E4B84A] transition-all duration-500`,style:{width:`${V}%`}})})]}),(0,m.jsx)(`div`,{className:`overflow-hidden rounded-2xl border border-[#DED8CC] bg-[#FFFDF8] p-6 shadow-[0_2px_10px_rgba(23,59,50,0.07)] md:p-10`,children:(0,m.jsxs)(`div`,{children:[(0,m.jsxs)(`div`,{className:`mb-6 flex items-center gap-3`,children:[(0,m.jsx)(`div`,{className:`flex h-10 w-10 items-center justify-center rounded-lg bg-[#173B32] text-sm font-bold text-[#E4B84A]`,children:String(a+1).padStart(2,`0`)}),(0,m.jsxs)(`div`,{children:[(0,m.jsx)(`p`,{className:`text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A948D]`,children:`Your Assessment`}),(0,m.jsx)(`p`,{className:`mt-0.5 text-xs text-[#66736B]`,children:`Choose the option that describes you best`})]})]}),(0,m.jsx)(`h2`,{className:`max-w-3xl text-2xl font-bold leading-tight text-[#173B32] md:text-3xl`,children:O[a].question}),(0,m.jsx)(`div`,{className:`mt-8 grid gap-3`,children:O[a].options.map((t,n)=>{let r=g[O[a].id]===t;return(0,m.jsxs)(`button`,{onClick:()=>k(t),className:`
                        group relative flex w-full items-center justify-between
                        overflow-hidden rounded-xl border
                        px-5 py-4 text-left
                        transition-colors duration-200
                        ${r?`border-[#173B32] bg-[#173B32]/5`:`border-[#DED8CC] bg-[#FFFDF8] hover:border-[#78927A] hover:bg-[#F6F1E8]/60`}
                      `,children:[(0,m.jsxs)(`div`,{className:`flex items-center gap-4`,children:[(0,m.jsx)(`div`,{className:`
                            flex h-9 w-9 items-center justify-center
                            rounded-lg text-xs font-semibold
                            transition-colors
                            ${r?`bg-[#173B32] text-[#E4B84A]`:`bg-[#F6F1E8] text-[#66736B] group-hover:text-[#173B32]`}
                          `,children:String.fromCharCode(65+n)}),(0,m.jsx)(`span`,{className:`
                            text-sm font-medium
                            ${r?`text-[#173B32]`:`text-[#66736B] group-hover:text-[#173B32]`}
                          `,children:t})]}),(0,m.jsx)(`div`,{className:`
                          flex h-7 w-7 items-center justify-center rounded-full
                          border transition-colors
                          ${r?`border-[#D66A4A] bg-[#D66A4A]`:`border-[#DED8CC] bg-[#FFFDF8]`}
                        `,children:r?(0,m.jsx)(e,{className:`h-3.5 w-3.5 text-[#FFFDF8]`}):(0,m.jsx)(l,{className:`h-3.5 w-3.5 text-[#8A948D] transition-transform group-hover:translate-x-0.5 group-hover:text-[#173B32]`})})]},n)})}),w&&(0,m.jsx)(`div`,{className:`mt-5 rounded-xl border border-[#B94F35]/30 bg-[#B94F35]/10 px-4 py-3 text-sm text-[#B94F35]`,children:w}),(0,m.jsxs)(`div`,{className:`mt-8 flex gap-3`,children:[(0,m.jsx)(`button`,{onClick:R,disabled:a===0||S,className:`\r
                    rounded-xl border border-[#173B32]\r
                    bg-[#FFFDF8]\r
                    px-6 py-3.5\r
                    text-sm font-semibold\r
                    text-[#173B32]\r
                    transition-colors\r
                    hover:bg-[#173B32]/5\r
                    disabled:cursor-not-allowed\r
                    disabled:opacity-30\r
                  `,children:`Back`}),(0,m.jsx)(`button`,{onClick:L,disabled:S,className:`\r
                    group flex flex-1 items-center justify-center gap-2\r
                    rounded-xl\r
                    bg-[#D66A4A]\r
                    px-6 py-3.5\r
                    text-sm font-semibold\r
                    text-[#FFFDF8]\r
                    shadow-[0_2px_8px_rgba(214,106,74,0.25)]\r
                    transition-colors duration-200\r
                    hover:bg-[#C45C3D]\r
                    disabled:opacity-60\r
                  `,children:S?(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(c,{className:`h-4 w-4 animate-spin`}),`Finding Careers...`]}):(0,m.jsxs)(m.Fragment,{children:[a===O.length-1?`See Results`:`Continue`,(0,m.jsx)(s,{className:`h-4 w-4 transition-transform group-hover:translate-x-1`})]})})]})]})}),(0,m.jsxs)(`div`,{className:`mt-5 flex items-center justify-center gap-2 text-[11px] text-[#8A948D]`,children:[(0,m.jsx)(o,{className:`h-3.5 w-3.5`}),`AI analyzes your responses to find your strongest career matches`]})]})})};export{g as default};