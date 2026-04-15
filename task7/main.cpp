#include <algorithm>
#include <cstdint>
#include <iostream>
#include <limits>
#include <vector>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n = 0;
    std::cin >> n;

    std::vector<std::int64_t> values(n + 1, 0);
    for (int i = 1; i <= n; ++i) {
        std::cin >> values[i];
    }

    std::sort(values.begin() + 1, values.end(), std::greater<std::int64_t>());

    std::vector<std::int64_t> prefix_sum(n + 1, 0);
    for (int i = 1; i <= n; ++i) {
        prefix_sum[i] = prefix_sum[i - 1] + values[i];
    }

    // f[i]: best Alex sum from suffix i..n when it's Alex's turn.
    std::vector<std::int64_t> best_from(n + 3, 0);
    // g[i] = max_{j >= i}(prefix_sum[j] + best_from[j + 2]).
    // Use -INF so we never allow an invalid "take nothing" transition.
    const std::int64_t negative_infinity =
        std::numeric_limits<std::int64_t>::min() / 4;
    std::vector<std::int64_t> best_suffix_choice(n + 3, negative_infinity);

    for (int i = n; i >= 1; --i) {
        const std::int64_t take_until_i =
            prefix_sum[i] + best_from[i + 2];
        best_suffix_choice[i] = std::max(take_until_i, best_suffix_choice[i + 1]);
        best_from[i] = -prefix_sum[i - 1] + best_suffix_choice[i];
    }

    std::cout << best_from[1] << '\n';
    return 0;
}
