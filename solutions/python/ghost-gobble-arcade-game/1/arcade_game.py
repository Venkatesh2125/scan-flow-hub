def eat_ghost(power_pellet_active, touching_ghost):
    """Return True if Pac-Man can eat a ghost."""
    return power_pellet_active and touching_ghost


def score(touching_power_pellet, touching_dot):
    """Return True if Pac-Man scores."""
    return touching_power_pellet or touching_dot


def lose(power_pellet_active, touching_ghost):
    """Return True if Pac-Man loses."""
    return not power_pellet_active and touching_ghost


def win(has_eaten_all_dots, power_pellet_active, touching_ghost):
    """Return True if Pac-Man wins."""
    return has_eaten_all_dots and not lose(power_pellet_active, touching_ghost)
