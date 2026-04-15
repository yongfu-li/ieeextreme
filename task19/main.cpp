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

    std::vector<std::int64_t> available(n);
    for (int i = 0; i < n; ++i) {
        std::cin >> available[i];
    }

    int m = 0;
    std::cin >> m;

    std::vector<std::vector<std::int64_t>> dishes(
        m, std::vector<std::int64_t>(n, 0));
    for (int d = 0; d < m; ++d) {
        for (int i = 0; i < n; ++i) {
            std::cin >> dishes[d][i];
        }
    }

    std::int64_t best = 0;

    for (int a = 0; a < m; ++a) {
        for (int b = a + 1; b < m; ++b) {
            std::int64_t possible = std::numeric_limits<std::int64_t>::max();

            for (int i = 0; i < n; ++i) {
                const std::int64_t need = dishes[a][i] + dishes[b][i];
                if (need == 0) {
                    continue;
                }
                possible = std::min(possible, available[i] / need);
            }

            if (possible > best) {
                best = possible;
            }
        }
    }

    std::cout << best << '\n';
    return 0;
}
