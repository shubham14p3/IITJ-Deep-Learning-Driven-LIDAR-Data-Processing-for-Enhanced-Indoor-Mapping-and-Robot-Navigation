import numpy as np

# ------------------------------------------------------------
# Helper: Add dummy features + labels
# ------------------------------------------------------------
def make_points(label, coords):
    """
    coords: (N,3) XYZ points
    returns:
        pts: (N,7) → xyz + 4 dummy features
        labels: (N,) class labels
    """
    N = coords.shape[0]
    extra = np.zeros((N, 4), dtype=np.float32)
    pts = np.hstack([coords, extra])
    labels = np.full((N,), label, dtype=np.int32)
    return pts, labels


# ------------------------------------------------------------
# Add ceiling (class 4)
# ------------------------------------------------------------
def add_ceiling(xmin, xmax, ymin, ymax, height=3.0, density=200):
    xs = np.linspace(xmin, xmax, density)
    ys = np.linspace(ymin, ymax, density)
    xx, yy = np.meshgrid(xs, ys)
    z = np.full_like(xx.flatten(), height)
    pts = np.column_stack([xx.flatten(), yy.flatten(), z])
    return make_points(4, pts)


# ============================================================
# SCENE 1
# ============================================================
def scene1():
    points = []
    labels = []

    # Walls (class 1)
    w = []
    for x in np.linspace(0, 10, 300):
        w.append([x, 0, 2])
        w.append([x, 10, 2])
    for y in np.linspace(0, 10, 300):
        w.append([0, y, 2])
        w.append([10, y, 2])
    p, l = make_points(1, np.array(w))
    points.append(p); labels.append(l)

    # Chair (class 2)
    xx, yy = np.meshgrid(np.linspace(2, 3, 40), np.linspace(2, 3, 40))
    p, l = make_points(2, np.column_stack([xx.flatten(), yy.flatten(), np.ones(xx.size)]))
    points.append(p); labels.append(l)

    # Table (class 5)
    xx, yy = np.meshgrid(np.linspace(5, 7, 60), np.linspace(4, 6, 60))
    p, l = make_points(5, np.column_stack([xx.flatten(), yy.flatten(), np.ones(xx.size)*1.2]))
    points.append(p); labels.append(l)

    # Window (class 6)
    ys = np.linspace(3, 7, 150)
    p, l = make_points(6, np.column_stack([np.zeros_like(ys), ys, np.ones_like(ys)*2.5]))
    points.append(p); labels.append(l)

    # Ceiling (class 4)
    p, l = add_ceiling(0, 10, 0, 10)
    points.append(p); labels.append(l)

    # Sofa (class 7) – add to ensure class 7 present
    xx, yy = np.meshgrid(np.linspace(7, 9, 50), np.linspace(2, 4, 50))
    p, l = make_points(7, np.column_stack([xx.flatten(), yy.flatten(), np.ones(xx.size)*1]))
    points.append(p); labels.append(l)

    P = np.vstack(points)
    L = np.hstack(labels)
    np.savez("scene1.npz", points=P, labels=L)
    print("scene1.npz saved", P.shape)


# ============================================================
# SCENE 2
# ============================================================
def scene2():
    points = []
    labels = []

    # Walls
    w = []
    for x in np.linspace(0, 12, 300):
        w.append([x, 0, 2])
        w.append([x, 12, 2])
    for y in np.linspace(0, 12, 300):
        w.append([0, y, 2])
        w.append([12, y, 2])
    p, l = make_points(1, np.array(w))
    points.append(p); labels.append(l)

    # Door (class 3)
    x = np.linspace(5, 7, 200)
    p, l = make_points(3, np.column_stack([x, np.zeros_like(x), np.linspace(0, 2, x.size)]))
    points.append(p); labels.append(l)

    # Window (class 6)
    y = np.linspace(4, 8, 200)
    p, l = make_points(6, np.column_stack([np.full_like(y, 12), y, np.ones_like(y)*3]))
    points.append(p); labels.append(l)

    # Table (class 5)
    xx, yy = np.meshgrid(np.linspace(3, 6, 50), np.linspace(3, 6, 50))
    p, l = make_points(5, np.column_stack([xx.flatten(), yy.flatten(), np.ones(xx.size)*1.2]))
    points.append(p); labels.append(l)

    # Chair (class 2)
    xx, yy = np.meshgrid(np.linspace(9, 10, 40), np.linspace(3, 4, 40))
    p, l = make_points(2, np.column_stack([xx.flatten(), yy.flatten(), np.ones(xx.size)]))
    points.append(p); labels.append(l)

    # Sofa (class 7)
    xx, yy = np.meshgrid(np.linspace(2, 4, 40), np.linspace(8, 10, 40))
    p, l = make_points(7, np.column_stack([xx.flatten(), yy.flatten(), np.ones(xx.size)*1]))
    points.append(p); labels.append(l)

    # Ceiling (class 4)
    p, l = add_ceiling(0, 12, 0, 12)
    points.append(p); labels.append(l)

    P = np.vstack(points)
    L = np.hstack(labels)
    np.savez("scene2.npz", points=P, labels=L)
    print("scene2.npz saved", P.shape)


# ============================================================
# SCENE 3
# ============================================================
def scene3():
    points = []
    labels = []

    # Walls
    w = []
    for x in np.linspace(0, 15, 400):
        w.append([x, 0, 2])
        w.append([x, 15, 2])
    for y in np.linspace(0, 15, 400):
        w.append([0, y, 2])
        w.append([15, y, 2])
    p, l = make_points(1, np.array(w))
    points.append(p); labels.append(l)

    # Sofa (class 7)
    xx, yy = np.meshgrid(np.linspace(3, 6, 80), np.linspace(3, 5, 80))
    p, l = make_points(7, np.column_stack([xx.flatten(), yy.flatten(), np.ones(xx.size)*1]))
    points.append(p); labels.append(l)

    # Table (class 5)
    xx, yy = np.meshgrid(np.linspace(7, 9, 60), np.linspace(8, 10, 60))
    p, l = make_points(5, np.column_stack([xx.flatten(), yy.flatten(), np.ones(xx.size)*1.2]))
    points.append(p); labels.append(l)

    # Window (class 6)
    y = np.linspace(5, 10, 200)
    p, l = make_points(6, np.column_stack([np.full_like(y, 15), y, np.ones_like(y)*3]))
    points.append(p); labels.append(l)

    # Door (class 3)
    x = np.linspace(6, 8, 200)
    p, l = make_points(3, np.column_stack([x, np.zeros_like(x), np.linspace(0,2,x.size)]))
    points.append(p); labels.append(l)

    # Ceiling (class 4)
    p, l = add_ceiling(0, 15, 0, 15)
    points.append(p); labels.append(l)

    # Chair (class 2)
    xx, yy = np.meshgrid(np.linspace(10, 11, 40), np.linspace(3, 4, 40))
    p, l = make_points(2, np.column_stack([xx.flatten(), yy.flatten(), np.ones(xx.size)]))
    points.append(p); labels.append(l)

    P = np.vstack(points)
    L = np.hstack(labels)
    np.savez("scene3.npz", points=P, labels=L)
    print("scene3.npz saved", P.shape)


# ============================================================
# SCENE 4
# ============================================================
def scene4():
    points = []
    labels = []

    # Walls
    w = []
    for x in np.linspace(0, 14, 300):
        w.append([x, 0, 2])
        w.append([x, 14, 2])
    for y in np.linspace(0, 14, 300):
        w.append([0, y, 2])
        w.append([14, y, 2])
    p, l = make_points(1, np.array(w))
    points.append(p); labels.append(l)

    # Bed (class 7)
    xx, yy = np.meshgrid(np.linspace(2, 6, 80), np.linspace(2, 5, 80))
    p, l = make_points(7, np.column_stack([xx.flatten(), yy.flatten(), np.ones(xx.size)*1]))
    points.append(p); labels.append(l)

    # Chair (class 2)
    xx, yy = np.meshgrid(np.linspace(10, 11, 40), np.linspace(3, 4, 40))
    p, l = make_points(2, np.column_stack([xx.flatten(), yy.flatten(), np.ones(xx.size)]))
    points.append(p); labels.append(l)

    # Door (class 3)
    x = np.linspace(6, 8, 200)
    p, l = make_points(3, np.column_stack([x, np.zeros_like(x), np.linspace(0,2,x.size)]))
    points.append(p); labels.append(l)

    # Window (class 6)
    y = np.linspace(4, 8, 200)
    p, l = make_points(6, np.column_stack([np.full_like(y, 14), y, np.ones_like(y)*3]))
    points.append(p); labels.append(l)

    # Ceiling (class 4)
    p, l = add_ceiling(0, 14, 0, 14)
    points.append(p); labels.append(l)

    P = np.vstack(points)
    L = np.hstack(labels)
    np.savez("scene4.npz", points=P, labels=L)
    print("scene4.npz saved", P.shape)


# ============================================================
# SCENE 5
# ============================================================
def scene5():
    points = []
    labels = []

    # Walls
    w = []
    for x in np.linspace(0, 10, 300):
        w.append([x, 0, 2])
        w.append([x, 10, 2])
    for y in np.linspace(0, 10, 300):
        w.append([0, y, 2])
        w.append([10, y, 2])
    p, l = make_points(1, np.array(w))
    points.append(p); labels.append(l)

    # Desk (table class 5)
    xx, yy = np.meshgrid(np.linspace(4, 7, 80), np.linspace(4, 6, 80))
    p, l = make_points(5, np.column_stack([xx.flatten(), yy.flatten(), np.ones(xx.size)*1.1]))
    points.append(p); labels.append(l)

    # Chair (class 2)
    xx, yy = np.meshgrid(np.linspace(2, 3, 40), np.linspace(4, 5, 40))
    p, l = make_points(2, np.column_stack([xx.flatten(), yy.flatten(), np.ones(xx.size)]))
    points.append(p); labels.append(l)

    # Window (class 6)
    y = np.linspace(3, 7, 200)
    p, l = make_points(6, np.column_stack([np.zeros_like(y), y, np.ones_like(y)*3]))
    points.append(p); labels.append(l)

    # Sofa (class 7)
    xx, yy = np.meshgrid(np.linspace(7, 9, 60), np.linspace(2, 4, 60))
    p, l = make_points(7, np.column_stack([xx.flatten(), yy.flatten(), np.ones(xx.size)]))
    points.append(p); labels.append(l)

    # Door (class 3)
    x = np.linspace(4, 6, 200)
    p, l = make_points(3, np.column_stack([x, np.zeros_like(x), np.linspace(0,2,x.size)]))
    points.append(p); labels.append(l)

    # Ceiling (class 4)
    p, l = add_ceiling(0, 10, 0, 10)
    points.append(p); labels.append(l)

    P = np.vstack(points)
    L = np.hstack(labels)
    np.savez("scene5.npz", points=P, labels=L)
    print("scene5.npz saved", P.shape)


# ------------------------------------------------------------
# RUN ALL SCENES
# ------------------------------------------------------------
if __name__ == "__main__":
    print("\nGenerating indoor dummy LiDAR scenes...\n")
    scene1()
    scene2()
    scene3()
    scene4()
    scene5()
    print("\nAll scenes generated successfully!\n")
