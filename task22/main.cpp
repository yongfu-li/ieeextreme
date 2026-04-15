#include <algorithm>
#include <cstdint>
#include <iostream>
#include <vector>

namespace {

bool can_cover_with_k(
    const std::vector<std::int64_t>& coords,
    const int k,
    const std::int64_t radius) {
    const int n = static_cast<int>(coords.size());
    int used = 0;
    int i = 0;
    int j = 0;
    int t = 0;

    while (i < n) {
        if (used == k) {
            return false;
        }
        ++used;

        const std::int64_t leftmost = coords[i];
        while (j < n && coords[j] <= leftmost + radius) {
            ++j;
        }
        const int center_idx = j - 1;
        const std::int64_t cover_right = coords[center_idx] + radius;

        if (t < i) {
            t = i;
        }
        while (t < n && coords[t] <= cover_right) {
            ++t;
        }
        i = t;
    }

    return true;
}

}  // namespace

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n = 0;
    int k = 0;
    std::cin >> n >> k;

    std::vector<std::int64_t> coords(n);
    for (int i = 0; i < n; ++i) {
        std::cin >> coords[i];
    }
    std::sort(coords.begin(), coords.end());

    std::int64_t low = 0;
    std::int64_t high = coords.back() - coords.front();

    while (low < high) {
        const std::int64_t mid = low + (high - low) / 2;
        if (can_cover_with_k(coords, k, mid)) {
            high = mid;
        } else {
            low = mid + 1;
        }
    }

    std::cout << low << '\n';
    return 0;
}
