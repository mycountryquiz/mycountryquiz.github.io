export interface CountryData {
  name: string;
  iso2: string;
  flag: string;
  continent: string;
  area: number | null;
  population: number | null;
  gdp: number | null;
  gdpPerCapita: number | null;
  gniPpp: number | null;
  density: number | null;
  literacy: number | null;
  hdi: number | null;
  lifeExpectancy: number | null;
}

export interface QuestionType {
  id: string;
  label: string;
  template: string;
  getValue: (c: CountryData) => number | null;
  format: (val: number) => string;
}

export interface GameState {
  correctAnswers: number;
  totalQuestions: number;
  currentStreak: number;
  bestStreak: number;
  hasAnswered: boolean;
  currentQuestion: QuestionType | null;
  country1: CountryData | null;
  country2: CountryData | null;
  correctCountry: CountryData | null;
  selectedQuestionId: string;
}

export const QUESTIONS: QuestionType[] = [
  { id: 'population', label: 'Population', template: 'Which country has a larger population?',
    getValue: c => c.population, format: v => v.toLocaleString() },
  { id: 'area', label: 'Area', template: 'Which country is larger by area?',
    getValue: c => c.area, format: v => `${v.toLocaleString()} km²` },
  { id: 'gdp', label: 'GDP', template: 'Which country has a higher GDP?',
    getValue: c => c.gdp, format: v => `$${v.toLocaleString()}M` },
  { id: 'gdp_per_capita', label: 'GDP per Capita', template: 'Which country has higher GDP per capita?',
    getValue: c => c.gdpPerCapita, format: v => `$${v.toLocaleString()}` },
  { id: 'density', label: 'Pop. Density', template: 'Which country has higher population density?',
    getValue: c => c.density, format: v => `${v.toFixed(1)}/km²` },
  { id: 'literacy', label: 'Literacy Rate', template: 'Which country has a higher literacy rate?',
    getValue: c => c.literacy, format: v => `${v.toFixed(1)}%` },
  { id: 'hdi', label: 'HDI', template: 'Which country has a higher Human Development Index?',
    getValue: c => c.hdi, format: v => v.toFixed(3) },
  { id: 'life_expectancy', label: 'Life Expectancy', template: 'Which country has higher life expectancy?',
    getValue: c => c.lifeExpectancy, format: v => `${v.toFixed(1)} years` }
];

const C = (name: string, iso2: string, flag: string, cont: string, area: number | null, pop: number | null,
  gdp: number | null, gdpPc: number | null, gniPpp: number | null, density: number | null,
  literacy: number | null, hdi: number | null, lifeExp: number | null): CountryData => ({
  name, iso2, flag, continent: cont, area, population: pop, gdp, gdpPerCapita: gdpPc,
  gniPpp, density, literacy, hdi, lifeExpectancy: lifeExp
});

export const COUNTRIES: CountryData[] = [
  // AFRICA
  C("Algeria","DZ","🇩🇿","Africa",2381741,45400000,239900,5284,13310,19.1,81.4,0.745,76.4),
  C("Angola","AO","🇦🇴","Africa",1246700,36000000,92124,2560,7250,28.9,72.0,0.595,62.0),
  C("Benin","BJ","🇧🇯","Africa",112622,13700000,19234,1404,4030,121.7,45.8,0.504,60.0),
  C("Botswana","BW","🇧🇼","Africa",581730,2600000,19396,7460,18600,4.5,88.9,0.708,61.1),
  C("Burkina Faso","BF","🇧🇫","Africa",274200,23000000,20327,884,2310,83.9,34.5,0.438,59.3),
  C("Cameroon","CM","🇨🇲","Africa",475442,28600000,48455,1694,4220,60.2,77.1,0.587,61.0),
  C("DR Congo","CD","🇨🇩","Africa",2344858,102300000,66380,649,1430,43.6,80.0,0.479,60.7),
  C("Egypt","EG","🇪🇬","Africa",1001450,105000000,387086,3686,16450,104.9,73.1,0.728,70.2),
  C("Ethiopia","ET","🇪🇹","Africa",1104300,126500000,163698,1294,3070,114.6,51.8,0.492,65.0),
  C("Ghana","GH","🇬🇭","Africa",238533,34100000,76370,2240,5870,143.0,79.0,0.602,63.8),
  C("Kenya","KE","🇰🇪","Africa",580367,55100000,113420,2058,5720,95.0,82.6,0.575,61.4),
  C("Morocco","MA","🇲🇦","Africa",446550,37500000,141109,3764,9140,84.0,75.9,0.698,74.0),
  C("Nigeria","NG","🇳🇬","Africa",923768,223800000,472620,2112,5860,242.3,62.0,0.548,52.7),
  C("South Africa","ZA","🇿🇦","Africa",1221037,60400000,399015,6607,16090,49.5,95.0,0.713,62.3),
  C("Tanzania","TZ","🇹🇿","Africa",947300,65500000,79162,1209,2980,69.2,78.1,0.532,66.2),
  C("Tunisia","TN","🇹🇳","Africa",163610,12400000,46840,3778,13130,75.8,79.7,0.732,73.8),
  C("Uganda","UG","🇺🇬","Africa",241038,48600000,45561,937,2660,201.6,79.0,0.525,62.7),
  // ASIA
  C("Afghanistan","AF","🇦🇫","Asia",652230,42240000,14580,345,null,64.8,37.3,0.462,62.0),
  C("Bangladesh","BD","🇧🇩","Asia",147570,172000000,460201,2676,7040,1166.0,74.9,0.670,72.4),
  C("China","CN","🇨🇳","Asia",9596960,1412000000,17963171,12720,23310,147.0,97.5,0.788,78.2),
  C("India","IN","🇮🇳","Asia",3287263,1428000000,3737000,2617,8400,434.0,74.4,0.644,67.2),
  C("Indonesia","ID","🇮🇩","Asia",1904569,277500000,1417387,5108,15850,145.7,96.0,0.713,67.6),
  C("Iran","IR","🇮🇷","Asia",1648195,89200000,388000,4351,16750,54.1,88.7,0.774,73.9),
  C("Iraq","IQ","🇮🇶","Asia",438317,44500000,267900,6021,11510,101.5,85.6,0.686,70.4),
  C("Israel","IL","🇮🇱","Asia",20770,9750000,525000,53853,47580,470.0,97.8,0.915,82.6),
  C("Japan","JP","🇯🇵","Asia",377975,124500000,4230862,33960,49240,329.6,99.0,0.920,84.8),
  C("Malaysia","MY","🇲🇾","Asia",330803,34300000,430895,12563,33550,103.7,95.9,0.807,74.9),
  C("Pakistan","PK","🇵🇰","Asia",881912,240500000,376493,1565,6530,272.8,58.0,0.544,66.1),
  C("Philippines","PH","🇵🇭","Asia",300000,117300000,435667,3715,10590,391.0,96.3,0.710,69.3),
  C("Saudi Arabia","SA","🇸🇦","Asia",2149690,36400000,1069437,29386,56920,16.9,97.6,0.875,76.9),
  C("Singapore","SG","🇸🇬","Asia",733,5920000,515548,87088,116500,8075.0,97.5,0.949,84.1),
  C("South Korea","KR","🇰🇷","Asia",100210,51780000,1721909,33268,52990,517.0,99.0,0.929,83.7),
  C("Thailand","TH","🇹🇭","Asia",513120,71800000,514945,7172,21220,140.0,94.1,0.803,79.3),
  C("Turkey","TR","🇹🇷","Asia",783562,85800000,1029303,12001,38170,109.4,96.7,0.838,76.0),
  C("UAE","AE","🇦🇪","Asia",83600,9440000,507532,53757,96850,112.9,98.0,0.937,78.7),
  C("Vietnam","VN","🇻🇳","Asia",331212,99500000,449900,4522,13860,300.4,95.8,0.726,73.6),
  // EUROPE
  C("Austria","AT","🇦🇹","Europe",83879,9100000,515768,56672,66800,108.5,99.0,0.926,82.0),
  C("Belgium","BE","🇧🇪","Europe",30528,11700000,609887,52133,65430,383.3,99.0,0.942,82.2),
  C("Czech Republic","CZ","🇨🇿","Europe",78867,10500000,330860,31510,49100,133.2,99.0,0.889,79.3),
  C("Denmark","DK","🇩🇰","Europe",43094,5900000,405626,68750,72680,137.0,99.0,0.952,81.4),
  C("Finland","FI","🇫🇮","Europe",338424,5550000,300186,54090,58580,16.4,99.0,0.942,82.0),
  C("France","FR","🇫🇷","Europe",643801,68000000,2923489,43000,55080,105.6,99.0,0.903,82.5),
  C("Germany","DE","🇩🇪","Europe",357022,84400000,4308854,51072,63150,236.4,99.0,0.950,81.7),
  C("Greece","GR","🇬🇷","Europe",131957,10430000,239300,22942,38050,79.0,97.9,0.887,80.1),
  C("Hungary","HU","🇭🇺","Europe",93028,9600000,212384,22122,40680,103.2,99.4,0.851,74.5),
  C("Ireland","IE","🇮🇪","Europe",70273,5200000,594095,114249,87260,74.0,99.0,0.950,82.0),
  C("Italy","IT","🇮🇹","Europe",301340,58900000,2169745,36834,52710,195.4,99.4,0.906,83.5),
  C("Netherlands","NL","🇳🇱","Europe",41543,17800000,1009000,56693,70930,428.5,99.0,0.946,82.4),
  C("Norway","NO","🇳🇴","Europe",323802,5500000,546768,99412,89100,17.0,99.0,0.966,83.2),
  C("Poland","PL","🇵🇱","Europe",312679,37600000,811229,21574,41370,120.2,99.8,0.881,76.5),
  C("Portugal","PT","🇵🇹","Europe",92212,10400000,287080,27600,40920,112.8,96.1,0.874,81.0),
  C("Romania","RO","🇷🇴","Europe",238391,19000000,348902,18367,40320,79.7,99.1,0.827,74.2),
  C("Russia","RU","🇷🇺","Europe",17098242,143400000,2240400,15624,36010,8.4,99.7,0.821,69.4),
  C("Spain","ES","🇪🇸","Europe",505990,47420000,1580694,33331,48540,93.7,98.6,0.911,83.3),
  C("Sweden","SE","🇸🇪","Europe",450295,10500000,593268,56502,62640,23.3,99.0,0.952,83.0),
  C("Switzerland","CH","🇨🇭","Europe",41291,8800000,869601,98839,82340,213.1,99.0,0.967,84.0),
  C("Ukraine","UA","🇺🇦","Europe",603550,37000000,160500,4339,14720,61.3,99.8,0.773,69.0),
  C("United Kingdom","GB","🇬🇧","Europe",242495,67500000,3332059,49384,54600,278.4,99.0,0.940,80.7),
  // NORTH AMERICA
  C("Canada","CA","N. America","N. America",9984670,40100000,2139840,53385,58040,4.0,99.0,0.935,82.7),
  C("Costa Rica","CR","🇨🇷","N. America",51100,5200000,68379,13150,24420,101.8,97.9,0.806,77.0),
  C("Cuba","CU","🇨🇺","N. America",109884,11100000,107352,9671,null,101.0,99.8,0.783,73.7),
  C("Dominican Rep.","DO","🇩🇴","N. America",48671,11300000,113642,10057,22760,232.2,95.0,0.768,72.6),
  C("Guatemala","GT","🇬🇹","N. America",108889,17600000,95003,5398,10250,161.7,83.3,0.627,69.2),
  C("Haiti","HT","🇭🇹","N. America",27750,11700000,21178,1810,3110,421.6,61.7,0.552,64.0),
  C("Honduras","HN","🇭🇳","N. America",112492,10400000,31717,3050,6340,92.5,87.2,0.624,70.1),
  C("Jamaica","JM","🇯🇲","N. America",10991,2800000,17099,6107,11290,254.8,88.7,0.709,70.5),
  C("Mexico","MX","🇲🇽","N. America",1964375,128900000,1811468,14056,22410,65.6,95.4,0.781,75.0),
  C("Nicaragua","NI","🇳🇮","N. America",130373,7050000,15787,2239,6220,54.1,82.6,0.667,74.5),
  C("Panama","PA","🇵🇦","N. America",75420,4400000,76523,17391,32980,58.3,95.7,0.820,76.2),
  C("USA","US","🇺🇸","N. America",9833517,335000000,27360935,81695,80300,34.1,99.0,0.927,77.5),
  // SOUTH AMERICA
  C("Argentina","AR","🇦🇷","S. America",2780400,46300000,641131,13846,26390,16.7,99.0,0.849,76.6),
  C("Bolivia","BO","🇧🇴","S. America",1098581,12400000,44315,3574,9540,11.3,94.5,0.692,63.6),
  C("Brazil","BR","🇧🇷","S. America",8515767,216400000,2173668,10047,17000,25.4,93.5,0.760,72.8),
  C("Chile","CL","🇨🇱","S. America",756102,19500000,335533,17206,28510,25.8,97.0,0.860,78.9),
  C("Colombia","CO","🇨🇴","S. America",1138910,52000000,363835,6997,18180,45.7,95.6,0.758,72.8),
  C("Ecuador","EC","🇪🇨","S. America",283561,18000000,118845,6603,12930,63.5,94.5,0.765,74.3),
  C("Paraguay","PY","🇵🇾","S. America",406752,6800000,42956,6317,15030,16.7,94.7,0.717,70.3),
  C("Peru","PE","🇵🇪","S. America",1285216,34000000,267603,7869,15310,26.4,94.5,0.762,73.7),
  C("Uruguay","UY","🇺🇾","S. America",176215,3400000,77241,22718,28200,19.3,98.8,0.830,77.7),
  C("Venezuela","VE","🇻🇪","S. America",916445,28400000,92200,3246,null,31.0,97.1,0.691,72.1),
  // OCEANIA
  C("Australia","AU","🇦🇺","Oceania",7692024,26500000,1687713,63688,59170,3.4,99.0,0.946,84.5),
  C("Fiji","FJ","🇫🇯","Oceania",18274,930000,5314,5714,14570,50.9,99.1,0.729,67.4),
  C("New Zealand","NZ","🇳🇿","Oceania",270467,5200000,251969,48455,52000,19.2,99.0,0.939,82.5),
  C("Papua New Guinea","PG","🇵🇬","Oceania",462840,10300000,30624,2973,4620,22.3,64.2,0.558,64.5),
];
