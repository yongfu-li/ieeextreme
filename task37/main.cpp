#include <iostream>
#include <utility>
#include <vector>

using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n = 0;
    int m = 0;
    int k = 0;
    cin >> n >> m >> k;

    vector<pair<int, int>> swaps(m + 1);
    for (int i = 1; i <= m; ++i) {
        int a = 0;
        int b = 0;
        cin >> a >> b;
        swaps[i] = {a, b};
    }

    // pref_pos[i] = position of element 1 after applying first i swaps.
    vector<int> pref_pos(m + 1, 0);
    pref_pos[0] = 1;
    for (int i = 1; i <= m; ++i) {
        const auto [a, b] = swaps[i];
        int current = pref_pos[i - 1];
        if (current == a) {
            current = b;
        } else if (current == b) {
            current = a;
        }
        pref_pos[i] = current;
    }

    // suffix_map[x] = final position after applying current suffix to x.
    // Initially, suffix is empty (identity transform).
    vector<int> suffix_map(n + 1, 0);
    for (int x = 1; x <= n; ++x) {
        suffix_map[x] = x;
    }

    int answer = -1;
    for (int i = m; i >= 1; --i) {
        // If we remove swap i, element 1 is at pref_pos[i - 1] before suffix i+1..m.
        const int final_pos_if_removed = suffix_map[pref_pos[i - 1]];
        if (final_pos_if_removed == k) {
            answer = i;
        }

        // Extend suffix to include swap i:
        // F_i(x) = F_{i+1}(S_i(x)) -> swap values at keys a and b.
        const auto [a, b] = swaps[i];
        swap(suffix_map[a], suffix_map[b]);
    }

    cout << answer << '\n';
    return 0;
}
