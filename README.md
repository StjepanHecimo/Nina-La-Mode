# Nina-La-Mode

Shop

Nina La mode je web stranica za prodaju odjeće. E sada, ovako nekako ćemo mi to sve postavit jednostavno, brzo i transparentno.

Prvo ćemo koristiti next.js vite webpack i to je to, serverside zbog boljeg SEO i ostalih stvari. Postavit ćeš prvi setup, moze i typescript. Za deployment koristimo vercel, i ne koristimo docker, domenu već imamo. Za bazu koristimo firebase i poslozi ENV za vercel i sa praznim varijablama ja ću ih ispuniti.

Postavi prvo projekt pa ti napišem daljne upute.

Stranica će imati home shop about contanct. Koristimo tri boje
Roza #E6B8B7
Krem #F2E8DC
Plava #1C2230

Home page će imati istaknute proizvode tri, ima slika u prilogu ali nemoj previše koristii ovaj vintage style nego čisto da pratiš crtu home page-a

Firebase bi trebao imati strukturu ovakvo i trebas mi slozit skriptu da automatski do poslozimo

Imat će proizovde, boju proizvoda, vrstu materijala, ako ima vise vrsta materijala mozda stavit sve u jedan json. Imat će naravno cijenu i naziv.

Isto tako baza će imati transakcije, odnosno ono što je potrebno da bi mogli capturati payment i koristiit paypal buisness za plaćanje, isto tako ako je i potrebno sa Brevo što treba, jer će korisnici moći naručit odabrani proizvod, stavit u košaricu i otići na plaćanje preko paypala, klasičan flow za shop, sestra ima paypal buisnes a ja cu sredit env i morat ćemo preko nodj runtime slozit i endpoint za to ujedno i povlačenje više proizovda iz baze. Možeš korak po korak . E sad ja neznam dali da prvo slozimo bazu podataka, pa da onda idemo na payment i dodavanje proizvoda u košaricu što kažeš?
