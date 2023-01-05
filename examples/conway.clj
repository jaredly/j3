

(def live (vec4 1. .6 1. 1.))
(def dead (vec4 0. 0. 0. 1.))

(defn isLive [{x} :Vec4] (> x .5))

(defn neighbor [offset :Vec2 coord :Vec2 res :Vec2 buffer :sampler2D]
	(let [coord (+ coord offset)]
		(if (isLive ([coord / res] buffer))
			1
			0)))

(def neighborhood
	[
		(vec2 -1 0)
		(vec2 -1 1)
		(vec2 -1 -1)
		(vec2 1 0)
		(vec2 1 1)
		(vec2 1 -1)
		(vec2 0 1)
		(vec2 0 -1)
	])

(defn map (<> T R N :(& uint const)) [arr :(Array T N) f :(fn [T] R)] :(Array R N)
	(switch arr
		[] []
		[one ...rest] [(f one) ...((>< map T R (len rest)) rest f)]))

(defn reduce (<> T R N :(& uint const)) [arr :(Array T N) initial :R f :(fn [R T] R)] :R
	(switch arr
		[] initial
		[one ...rest] ((>< reduce T R (len rest)) rest (f initial one) f)))

(defn countNeighbors [coord :Vec2 res :Vec2 buffer :sampler2D]
	(reduce neighborhood 0 (fn [offset total] (+ total (neighbor offset coord res buffer)))))

(defn drawToBuffer [env :GLSLEnv fragCoord :Vec2 buffer :sampler2D]
	(if (< (.time env) 0.01)
		(if (> (random (/ fragCoord (.resolution env))) 0.95)
			live dead)
		(let [self (isLive ([(/ fragCoord (.resolution env))] buffer))
			  neighbors (countNeighbors fragCoord (.resolution env) buffer)]
			(if (|| (&& self (== 2 neighbors)) (== neighbors 3))
				live dead))))

(defn drawToScreen [env :GLSLEnv fragCoord :Vec2 buffer0 :sampler2D]
	(let [diff (- fragCoord env.mouse)
		  coord (if (< (length diff) 250.)
					(- env.mouse (/ diff 4.))
					fragCoord)]
		([(/ coord env.resolution)] buffer0)))

