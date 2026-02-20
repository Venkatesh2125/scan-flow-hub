"""
Functions to help calculate the cooking time for a lasagna recipe.
"""

# Constant for the expected bake time in minutes
EXPECTED_BAKE_TIME = 40


def bake_time_remaining(elapsed_bake_time):
    """Calculate the remaining bake time.

    :param elapsed_bake_time: int - minutes the lasagna has already baked
    :return: int - remaining minutes the lasagna should bake
    """
    return EXPECTED_BAKE_TIME - elapsed_bake_time


def preparation_time_in_minutes(number_of_layers):
    """Calculate preparation time based on number of layers.

    Each layer takes 2 minutes to prepare.

    :param number_of_layers: int - number of layers in the lasagna
    :return: int - total preparation time in minutes
    """
    PREPARATION_TIME_PER_LAYER = 2
    return number_of_layers * PREPARATION_TIME_PER_LAYER


def elapsed_time_in_minutes(number_of_layers, elapsed_bake_time):
    """Calculate total elapsed cooking time.

    :param number_of_layers: int - number of layers in the lasagna
    :param elapsed_bake_time: int - minutes the lasagna has been baking
    :return: int - total time spent cooking in minutes
    """
    return preparation_time_in_minutes(number_of_layers) + elapsed_bake_time
