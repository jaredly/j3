(deftype vec2 {x float y float})

(deftype vec4 {x float y float z float w float})

(defn gradient [pos :vec2] :vec4 {x pos.x#:0 y pos.y#:0 z 0. w 1.})

(defn diff [a :uint b :uint] (if (>#e54a34202e43149191538039477964c7b3eb13ff a#:0 b#:1) (-#1366e90bb9aaf8725a46c0a032388624a2a04050 a#:0 b#:1) (-#1366e90bb9aaf8725a46c0a032388624a2a04050 b#:1 a#:0)))

(defn abs- [a :float b :float] (if (>#9d156936c7b78a63b06e1357e431dfb16d44e7ae a#:0 b#:1) (-#1e7454ad16851deae13ef8994f31bdc2ba39ba7b a#:0 b#:1) (-#1e7454ad16851deae13ef8994f31bdc2ba39ba7b b#:1 a#:0)))

(defn move-circle [circle (: {pos vec2 radius float}) which (: ['center 'radius]) pos :vec2] (switch which#:1 'center {pos pos#:2 radius circle.radius#:0} 'radius {radius (abs-#fb822474163b73cda42ff78527c42898be317580 pos.x#:2 circle.pos.x#:0) pos circle.pos#:0}))

(deftype corners {minx float miny float maxx float maxy float})

(defn corners->rect [{$ minx miny maxx maxy} :corners] {pos {x minx#:0 y miny#:1} size {x (-#1e7454ad16851deae13ef8994f31bdc2ba39ba7b maxx#:2 minx#:0) y (-#1e7454ad16851deae13ef8994f31bdc2ba39ba7b maxy#:3 miny#:1)}})

(defn rect->corners [{$ pos size} (: {pos vec2 size vec2})] :corners {minx pos.x#:0 miny pos.y#:0 maxx (+#20f1ead32c25f42e1fb01d6bf4c13fd05035c787 pos.x#:0 size.x#:1) maxy (+#20f1ead32c25f42e1fb01d6bf4c13fd05035c787 pos.y#:0 size.y#:1)})

(defn min [a :float b :float] (if (<#28cbcbbb8bdd7028be39be6da0908b35ccef9859 a#:0 b#:1) a#:0 b#:1))

(defn max [a :float b :float] (if (<#28cbcbbb8bdd7028be39be6da0908b35ccef9859 a#:0 b#:1) b#:1 a#:0))

(defn normalize [{$ minx miny maxx maxy} :corners] {minx (min#7873e262b287152d486953928c64c10c2824b526 minx#:0 maxx#:2) miny (min#7873e262b287152d486953928c64c10c2824b526 miny#:1 maxy#:3) maxx (max#0c714d36f983cca0765762783892d1978f2f45de minx#:0 maxx#:2) maxy (max#0c714d36f983cca0765762783892d1978f2f45de miny#:1 maxy#:3)})

(deftype corner ['tl 'tr 'bl 'br])

(defn set-corner [rect :corners corner :corner pos :vec2] :corners (normalize#f72af7305db9d2dcea739d1d570e0a3f6d97159f (switch corner#:1 'tl {...rect#:0 minx pos.x#:2 miny pos.y#:2} 'tr {...rect#:0 maxx pos.x#:2 miny pos.y#:2} 'bl {...rect#:0 minx pos.x#:2 maxy pos.y#:2} 'br {...rect#:0 maxx pos.x#:2 maxy pos.y#:2})))

(deftype rect {pos vec2 size vec2})

(defn set-corner [rect :rect corner :corner pos :vec2] (corners->rect#87f745ec9bc5755d1372bccc74a5bfcb40b96576 (set-corner#55ae4fb2a135e168b1eba74befeb48b0bc05f79b (rect->corners#13a336a0f71454fad577416784e9f3466e359cc3 rect#:0) corner#:1 pos#:2)))

(defn move-rect [rect :rect which (: ['center corner]) pos :vec2] (switch which#:1 'center {...rect#:0 pos pos#:2} corner (set-corner#8b5db9cc028b49387a026f6be978df71f20c4703 rect#:0 corner#:3 pos#:2)))
