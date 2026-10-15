// Builds an editable Moon Modeler document from the app-saved native template.
// Reads Mongoose schemas only; never connects to MongoDB or reads member data.
const fs=require('node:fs'),path=require('node:path'),{randomUUID:uuid}=require('node:crypto');
const root=path.resolve(__dirname,'../..');
require(root+'/node_modules/ts-node').register({transpileOnly:true,project:root+'/tsconfig.json'});
require(root+'/node_modules/reflect-metadata');
const clone=o=>JSON.parse(JSON.stringify(o));
const template=JSON.parse(fs.readFileSync(__dirname+'/Hotelia-template.dmm'));
const inventory=JSON.parse(fs.readFileSync(__dirname+'/backend-schema.json'));
const t0=Object.values(template.tables)[0],d0=Object.values(template.diagrams)[0],item0=d0.diagramItems[t0.id],r0=Object.values(template.relations)[0],link0=Object.values(d0.diagramLinks)[0],note0=Object.values(template.notes)[0];
const document={...clone(template),tables:{},relations:{},notes:{},lines:{},otherObjects:{},diagrams:{},diagramsOrder:[],order:[],collapsedTreeItems:[]};
document.model={...document.model,id:uuid(),name:'Hotelia - Backend ER Model',desc:'MongoDB model based on current Hotelia Mongoose schemas (2026-10-14). Nestar-style overview and focused diagrams. References are application-level MongoDB links, not SQL foreign-key constraints.',isDirty:false,path:''};
const tables={},positions={sessions:[40,160],paymentCards:[40,390],follows:[40,710],likes:[40,940],views:[40,1170],members:[530,160],boardArticles:[530,830],notices:[530,1200],hotels:[1060,160],comments:[1060,830],notifications:[1060,1200],rooms:[1590,160],bookings:[1590,720],boconfigs:[1590,1400]};
const descriptions={members:'USER / HOTEL_OWNER / ADMIN. Password is hashed and hidden; memberImage may be empty (frontend default avatar).',hotels:'ownerId references a HOTEL_OWNER. Uzbekistan, Kazakhstan and Kyrgyzstan destination focus. Rating/reviews and like/view counters are service-maintained.',rooms:'A room document is a room type, not one physical room. roomQuantity is total inventory; roomPrice uses USD.',bookings:'Half-open date range [checkIn, checkOut). Backend computes nights and totalPrice. Free cancellation for 15 minutes; automatic confirmation after that deadline; later guest cancellation fee is 5%. Demo payment only, no real charge. Legacy bookings may lack payment fields.',comments:'Hotel reviews use commentGroup=HOTEL, a completed bookingId and rating 1-5. commentRefId is polymorphic (HOTEL / MEMBER / ARTICLE). One hotel review per booking.',likes:'Hotel favorites use likeGroup=HOTEL; no separate favorites collection. likeRefId is polymorphic (HOTEL / MEMBER / ARTICLE).',views:'One view per member and target. viewRefId is polymorphic (HOTEL / MEMBER / ARTICLE).',follows:'Both followingId and followerId reference members.',boardArticles:'Journal/community content with author memberId. Separate from hotels.',notifications:'Private inbox scoped to receiverId. Optional hotel/room/booking/article/support-inquiry targets. Historical authorId is retained.',notices:'Announcements/FAQ and support inquiries. Personal messages to admin are stored here, with response/revision fields.',sessions:'Refresh-token hashes only, never raw refresh tokens. expiresAt has TTL cleanup, also checked by authentication.',paymentCards:'One private demo card per member. Only brand, last4, holder and expiry metadata. No full card number or CVV; PENDING status.',boconfigs:'Independent site configuration (key/value); no member/hotel relationship.'};
function defaultText(p){const v=p.options.default;if(v===undefined)return '';if(typeof v==='function')return 'Default: function';return 'Default: '+JSON.stringify(v);}
for(const entry of inventory.collections){
 const schema=require(root+'/apps/hotelia-api/src/schemas/'+entry.model+'.model.ts').default;
 const table={...clone(t0),id:uuid(),name:entry.collection,desc:descriptions[entry.collection]+'\n\nIndexes:\n'+schema.indexes().map(([keys,opts])=>JSON.stringify(keys)+' '+JSON.stringify(opts)).join('\n'),cols:[],relations:[],lines:[],keys:[],indexes:[],generate:false};
 const fields=[...entry.fields].sort((a,b)=>a.name==='_id'?-1:b.name==='_id'?1:0);
 // __v is the implicit Mongoose version key and is not a required application input.
 if(schema.options.versionKey!==false) fields.push({name:schema.options.versionKey||'__v',type:'Number',required:false,implicit:true});
 for(const field of fields){
  const p=schema.path(field.name),base=p?.instance||field.type;
  let datatype=({String:'string',Number:'double',Boolean:'bool',Date:'date',ObjectId:'objectId',Array:'array'})[base]||'string';
  if(base==='Number'&&p?.validators?.some(v=>v.validator===Number.isInteger))datatype='int';
  if(base==='String'&&field.enumValues?.length)datatype='enum';
  if(base==='Array')datatype=p?.caster?.enumValues?.length?'enum':'string';
  const extras=[field.ref?'Reference: '+field.ref:'',field.hidden?'Hidden from default queries':'',field.immutable?'Immutable':'',defaultText(p||{options:{}}),field.implicit?'Automatic Mongoose version key':'',field.enumValues?.length?'Allowed: '+field.enumValues.join(', '):''].filter(Boolean);
  table.cols.push({...clone(t0.cols[0]),id:uuid(),name:field.name,datatype,pk:field.name==='_id',nn:field.required,list:base==='Array',fk:Boolean(field.ref),comment:extras.join('; '),enum:field.enumValues?.length?field.enumValues.map(v=>JSON.stringify(v)).join(', '):field.arrayEnumValues?.map(v=>JSON.stringify(v)).join(', ')||'',validation:p?.options.match?String(p.options.match):'',data:''});
 }
 table.keys=[{id:uuid(),name:'Primary',isPk:true,cols:[{id:uuid(),colid:table.cols.find(c=>c.name==='_id').id}]}];
 document.tables[table.id]=table;tables[entry.model]=table;document.order.push(table.id);
}
function ref(parentName,childName,fieldName,polymorphic=false){
 const parent=tables[parentName],child=tables[childName],field=child.cols.find(c=>c.name===fieldName);
 if(!parent||!field)throw Error('Missing reference '+childName+'.'+fieldName);
 const one=(childName==='PaymentCard'&&fieldName==='memberId')||(childName==='Comment'&&fieldName==='bookingId');
 const r={...clone(r0),id:uuid(),name:child.name+'.'+fieldName+' -> '+parent.name,desc:polymorphic?'Polymorphic target selected by the group discriminator; alternative to other targets. Not a SQL foreign key.':'MongoDB ObjectId reference, validated in the service layer.',parent_key:parent.keys[0].id,parent:parent.id,child:child.id,c_mp:field.nn&&!polymorphic?'true':'false',c_mch:'false',c_p:'one',c_ch:one?'one':'many',c_cp:'',c_cch:'',cols:[{id:uuid(),parentcol:parent.cols.find(c=>c.name==='_id').id,childcol:field.id}],generate:false};
 document.relations[r.id]=r;parent.relations.push(r.id);if(parent!==child)child.relations.push(r.id);field.fk=true;
}
for(const entry of inventory.collections)for(const field of entry.fields)if(field.ref)ref(field.ref,entry.model,field.name);
for(const [child,fields]of Object.entries(inventory.logicalReferences))for(const [field,parents]of Object.entries(fields))for(const parent of parents)ref(parent,child,field,parents.length>1);
const title=uuid();document.notes[title]={...clone(note0),id:title,name:'Hotelia ER - title',desc:'<h1>HOTELIA</h1><p>MongoDB / Mongoose backend ER model &nbsp; | &nbsp; 14 collections &nbsp; | &nbsp; 2026-10-14</p>'};
const legend=uuid();document.notes[legend]={...clone(note0),id:legend,name:'Model rules',desc:'<h2>MODEL RULES</h2><p>Orange: members / hotels / rooms / bookings. Blue: supporting collections.</p><p>NN = Mongoose required:true; key = identifier/reference; enum = permitted values.</p><p>References are logical MongoDB links. Group-based targets are alternatives.</p><p>Favorites = likes (HOTEL). Reviews = comments (HOTEL, completed booking).</p><p>Availability: checkIn &lt; existingCheckOut AND checkOut &gt; existingCheckIn.</p><p>Overlapping reserved rooms must not exceed roomQuantity.</p><p>15-minute free cancellation; auto-confirm; later guest fee 5%. USD.</p><p>paymentCards: demo metadata only; no PAN or CVV, no real charge.</p><p>Exact indexes and field defaults are in collection/field descriptions.</p>'};
function diagram(name,models,layout,main=false){
 const d={...clone(d0),id:uuid(),name,description:'Current backend schema. All collection and field names match the source. See descriptions for indexes, defaults and polymorphic references.',main,isOpen:true,zoom:main?0.5:0.7,background:'#333333',lineColor:'#dddddd',descriptionsColor:'#ffffff',diagramItems:{},diagramLinks:{},scroll:{x:0,y:0},showRelationshipNames:false,showCardinalityCaptions:true,lineWidth:'1'};
 for(const model of models){const t=tables[model],pos=layout[t.name];if(!pos)throw Error('No layout '+t.name);d.diagramItems[t.id]={...clone(item0),referencedItemId:t.id,x:pos[0],y:pos[1],gWidth:330,gHeight:25+t.cols.length*19,resized:true,background:['Member','Hotel','Room','Booking'].includes(model)?'#ff9800':'#03a9f4',color:'#ffffff',cardBackground:'#404040'};}
 for(const r of Object.values(document.relations))if(d.diagramItems[r.parent]&&d.diagramItems[r.child])d.diagramLinks[r.id]={...clone(link0),referencedItemId:r.id,color:r.desc.startsWith('Polymorphic')?'#7eafc6':'#dddddd',width:1};
 d.diagramItems[title]={...clone(item0),referencedItemId:title,x:40,y:20,gWidth:1500,gHeight:105,resized:true,color:'#ffffff',background:'transparent'};
 if(main)d.diagramItems[legend]={...clone(item0),referencedItemId:legend,x:40,y:1630,gWidth:1850,gHeight:260,resized:true,color:'#ffffff',background:'transparent'};
 document.diagrams[d.id]=d;if(!main)document.diagramsOrder.push(d.id);return d;
}
const main=diagram('Hotelia - All Collections',Object.keys(tables),positions,true);document.model.activeDiagram=main.id;
diagram('Booking & Inventory',['Member','Hotel','Room','Booking','Comment','PaymentCard'],{members:[40,160],hotels:[550,160],rooms:[1060,160],bookings:[1060,720],comments:[550,830],paymentCards:[40,830]});
diagram('Community & Journal',['Member','BoardArticle','Follow','Like','View','Comment','Hotel'],{members:[550,160],boardArticles:[1060,160],hotels:[40,160],follows:[40,830],likes:[40,1090],views:[550,1260],comments:[1060,830]});
diagram('Auth & Notifications',['Member','Session','PaymentCard','Notification','Notice','BoConfig','Booking','Hotel','Room','BoardArticle'],{members:[550,160],sessions:[40,160],paymentCards:[40,460],notifications:[1060,160],notices:[1060,620],boconfigs:[40,830],bookings:[1570,160],hotels:[1570,890],rooms:[1060,1070],boardArticles:[550,890]});
fs.writeFileSync(__dirname+'/Hotelia.dmm',JSON.stringify(document,null,'\t')+'\n');
console.log(JSON.stringify({collections:Object.keys(document.tables).length,fields:Object.values(document.tables).reduce((n,t)=>n+t.cols.length,0),references:Object.keys(document.relations).length,diagrams:Object.values(document.diagrams).map(d=>d.name)},null,2));
