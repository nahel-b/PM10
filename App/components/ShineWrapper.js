import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Polygon, Path } from 'react-native-svg';

/**
 * ShineWrapper
 * Un composant wrapper qui ajoute de petites étoiles ("shine") animées (scale + opacité)
 * autour ou à l'intérieur de son enfant. Les étoiles apparaissent aléatoirement puis disparaissent.
 *
 * Props principales:
 *  - mode: 'edges' | 'inside' | 'mixed' (position des étoiles)
 *  - colors: tableau de couleurs
 *  - minSize / maxSize: taille en px des étoiles
 *  - duration: durée d'une étoile (ms)
 *  - spawnIntervalRange: [min, max] ms entre apparitions (aléatoire)
 *  - maxConcurrent: nombre max d'étoiles simultanées
 *  - active: activer/désactiver le spawning
 *  - insidePadding: marge intérieure pour éviter de coller les bords en mode inside
 *  - points: nombre de pointes de l'étoile
 *  - roundness: 0..0.5 intensité de l'arrondi des pointes (cartoon)
 *  - intensity: (0..1) multiplie la probabilité de spawn (agit sur spawn scheduling)
 *  - spawnPerInterval: nombre d'étoiles à tenter de créer à chaque tick (défaut 1)
 *  - minStars: garantit un minimum (si possible) en dessous duquel on essaye de rattraper
 *
 * Méthodes via ref:
 *  - start()
 *  - stop()
 *  - burst(count = 5) : génère immédiatement plusieurs étoiles
 */

const DEFAULT_COLORS = ['#25afd8ff', '#f0ca42ff', '#f08b60ff', '#FFF4C2'];


const ShineWrapper = forwardRef(function ShineWrapper(
  {
    children,
    mode = 'mixed',
    colors = DEFAULT_COLORS,
    minSize = 6,
    maxSize = 20,
    duration = 1200,
    spawnIntervalRange = [700, 1800],
    spawnPerInterval = 1,
    minStars = 0,
    maxConcurrent = 8,
    active = true,
    insidePadding = 2,
    points = 5,
    roundness = 0.35,
    intensity = 1,
    variant = 'default', // 'default' | 'highlight'
    style,
  },
  ref
) {
  const [layout, setLayout] = useState(null); // {width,height}
  const [stars, setStars] = useState([]); // {id,x,y,size,color,anim, rotate, dxN, dyN, drift}
  const nextId = useRef(0);
  const timerRef = useRef(null);
  const runningRef = useRef(active);
  const starsCountRef = useRef(0);
  const rafRef = useRef(null);
  const nextAtRef = useRef(0);
  const healthRef = useRef(null);

  useEffect(() => {
    starsCountRef.current = stars.length;
  }, [stars.length]); // Changé pour réagir aux changements de longueur

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // Génère une étoile (position + animation) et l'ajoute si possible
  const spawnStar = useCallback((forceBurst = false) => {
    if (!layout || (!runningRef.current && !forceBurst)) return false;

    const { width, height } = layout;
    
    // Vérifier d'abord si on peut ajouter une étoile
    if (starsCountRef.current >= maxConcurrent) {
      return false;
    }

    const id = ++nextId.current;
    const size = Math.round(minSize + Math.random() * (maxSize - minSize));
    const color = colors[Math.floor(Math.random() * colors.length)] || '#FFFFFF';
    const anim = new Animated.Value(0);
    const rotate = Math.floor(Math.random() * 360);

    let x, y;
    const decideMode = mode === 'mixed' ? (Math.random() < 0.5 ? 'edges' : 'inside') : mode;

    if (decideMode === 'inside') {
      x = insidePadding + Math.random() * (width - insidePadding * 2);
      y = insidePadding + Math.random() * (height - insidePadding * 2);
    } else if (decideMode === 'edges') {
      const perimeter = 2 * (width + height);
      const r = Math.random() * perimeter;
      if (r < width) { // top
        x = r; y = 0;
      } else if (r < width + height) { // right
        x = width; y = r - width;
      } else if (r < width + height + width) { // bottom
        x = r - (width + height); y = height;
      } else { // left
        x = 0; y = r - (width + height + width);
      }
    } else { // fallback
      x = Math.random() * width;
      y = Math.random() * height;
    }

    x = clamp(x, 0, layout.width);
    y = clamp(y, 0, layout.height);

    const cx = width / 2;
    const cy = height / 2;
    let dx = x - cx;
    let dy = y - cy;
    let len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.001) {
      const a = Math.random() * Math.PI * 2;
      dx = Math.cos(a);
      dy = Math.sin(a);
      len = 1;
    }
    const dxN = dx / len;
    const dyN = dy / len;
    const drift = 8 + Math.random() * 14;

    const star = { id, x, y, size, color, anim, rotate, dxN, dyN, drift };

    setStars(prev => {
      if (prev.length >= maxConcurrent) return prev;
      // Mettre à jour immédiatement le compteur
      starsCountRef.current = prev.length + 1;
      return [...prev, star];
    });

    // Lancer l'animation après insertion pour éviter effets dans setState (prévient le warning)
    requestAnimationFrame(() => {
      Animated.timing(anim, {
        toValue: 1,
        duration: duration + Math.random() * 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setStars(curr => {
          const filtered = curr.filter(s => s.id !== id);
          // Mettre à jour le compteur quand une étoile disparaît
          starsCountRef.current = filtered.length;
          return filtered;
        });
      });
    });

    return true;
  }, [layout, mode, colors, maxConcurrent, minSize, maxSize, duration, insidePadding]);

  // Boucle continue via requestAnimationFrame pour un spawn robuste
  const runLoop = useCallback(() => {
    if (!runningRef.current) return;

    const hi = variant === 'highlight';
    const effSpawnIntervalRange = hi ? [220, 380] : spawnIntervalRange;
    const effSpawnPerInterval = hi ? Math.max(1, spawnPerInterval) : spawnPerInterval;
    const effMinStars = hi ? Math.max(minStars, 4) : minStars;
    const effIntensity = hi ? Math.max(intensity, 1.4) : intensity;

    const pickDelay = () => {
      const [a, b] = effSpawnIntervalRange;
      const base = a + Math.random() * (b - a);
      return base / clamp(effIntensity || 1, 0.1, 5);
    };

    const tick = () => {
      if (!runningRef.current) return;
      const now = Date.now();
      if (!nextAtRef.current) nextAtRef.current = now + pickDelay();
      // si on a dépassé l'échéance, on spawn et on reprogramme
      if (now >= nextAtRef.current) {
        // Tenter de spawn les étoiles demandées
        let spawned = 0;
        for (let i = 0; i < effSpawnPerInterval; i++) {
          if (spawnStar()) spawned++;
        }
        
        // maintenir minimum seulement si on a réussi à spawner au moins une étoile
        if (effMinStars > 0 && spawned > 0) {
          const target = Math.min(effMinStars, maxConcurrent);
          let attempts = 0;
          while (starsCountRef.current < target && attempts < 10) {
            if (spawnStar()) {
              // succès
            }
            attempts++;
          }
        }
        
        nextAtRef.current = now + pickDelay();
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    // démarrer la boucle
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [variant, spawnIntervalRange, spawnPerInterval, minStars, intensity, maxConcurrent, spawnStar]);

  // Démarrer / arrêter
  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    nextAtRef.current = 0;
    if (timerRef.current) clearTimeout(timerRef.current);
    runLoop();
  }, [runLoop]);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const burst = useCallback((count = 5) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => spawnStar(true), i * 40);
    }
  }, [spawnStar]);

  useImperativeHandle(ref, () => ({ start, stop, burst }));

  // Effet initial / changement active
  useEffect(() => {
    runningRef.current = active;
    if (active) {
      nextAtRef.current = 0;
      if (timerRef.current) clearTimeout(timerRef.current);
      runLoop();
    } else {
      stop();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, runLoop, stop]);

  // Interval de "santé" pour garantir un minimum d'étoiles même si RAF est ralenti
  useEffect(() => {
    if (!runningRef.current) return;
    if (healthRef.current) clearInterval(healthRef.current);
    healthRef.current = setInterval(() => {
      if (!runningRef.current) return;
      // recalcul léger des paramètres
      const hi = variant === 'highlight';
      const target = Math.min(maxConcurrent, Math.max(hi ? 4 : minStars, 1));
      if (starsCountRef.current < target) {
        // spawn 1 ou 2 pour rattraper avec vérification de succès
        spawnStar();
        if (starsCountRef.current + 1 < target) {
          // Petit délai avant le second spawn
          setTimeout(() => spawnStar(), 50);
        }
      }
    }, 1000); // Augmenté l'intervalle pour éviter les conflits
    return () => {
      if (healthRef.current) clearInterval(healthRef.current);
    };
  }, [variant, minStars, maxConcurrent, spawnStar]);

  // Génération d'un chemin d'étoile aux coins arrondis (cartoon)
  const buildRoundedStarPath = useCallback(() => {
    const outerR = 50;
    const innerR = outerR * 0.45;
    const verts = [];
    const angleStep = Math.PI / points; // outer+inner intercalés
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = -Math.PI / 2 + i * angleStep; // commence en haut
      const x = 50 + r * Math.cos(angle);
      const y = 50 + r * Math.sin(angle);
      verts.push({ x, y });
    }
    // arrondi via points d'entrée/sortie + courbe quadratique
    const f = Math.min(0.5, Math.max(0, roundness));
    let d = '';
    for (let i = 0; i < verts.length; i++) {
      const curr = verts[i];
      const prev = verts[(i - 1 + verts.length) % verts.length];
      const next = verts[(i + 1) % verts.length];
      const toPrevX = prev.x - curr.x;
      const toPrevY = prev.y - curr.y;
      const toNextX = next.x - curr.x;
      const toNextY = next.y - curr.y;
      const distPrev = Math.sqrt(toPrevX * toPrevX + toPrevY * toPrevY);
      const distNext = Math.sqrt(toNextX * toNextX + toNextY * toNextY);
      const cutPrev = (distPrev * f);
      const cutNext = (distNext * f);
      const entryX = curr.x + (toPrevX / distPrev) * cutPrev;
      const entryY = curr.y + (toPrevY / distPrev) * cutPrev;
      const exitX = curr.x + (toNextX / distNext) * cutNext;
      const exitY = curr.y + (toNextY / distNext) * cutNext;
      if (i === 0) {
        d += `M${entryX},${entryY}`;
      } else {
        d += `L${entryX},${entryY}`;
      }
      // Quadratic curve utilisant le sommet comme point de contrôle
      d += `Q${curr.x},${curr.y} ${exitX},${exitY}`;
    }
    d += 'Z';
    return d;
  }, [points, roundness]);

  const starPath = buildRoundedStarPath();

  return (
    <View
      collapsable={false}
      pointerEvents="box-none"
      style={[styles.container, style]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setLayout({ width, height });
      }}
    >
      {children}
      {/* Overlay des étoiles */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {stars.map((s) => {
          const scale = s.anim.interpolate({
            inputRange: [0, 0.3, 0.8, 1],
            outputRange: [0, 1.25, 1, 0.15],
          });
          const opacity = s.anim.interpolate({
            inputRange: [0, 0.15, 0.7, 1],
            outputRange: [0, 1, 1, 0],
          });
          const translateX = s.anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, s.dxN * s.drift],
          });
          const translateY = s.anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, s.dyN * s.drift],
          });
          return (
            <Animated.View
              key={s.id}
              style={[
                styles.star,
                {
                  left: s.x - s.size / 2,
                  top: s.y - s.size / 2,
                  width: s.size,
                  height: s.size,
                  opacity,
                  transform: [
                    { translateX },
                    { translateY },
                    { scale },
                    { rotate: `${s.rotate}deg` },
                  ],
                },
              ]}
            >
              <Svg width="100%" height="100%" viewBox="0 0 100 100">
                <Path d={starPath} fill={s.color} />
              </Svg>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  star: {
    position: 'absolute',
  },
});

export default ShineWrapper;
