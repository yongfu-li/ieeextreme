#include <algorithm>
#include <iostream>
#include <unordered_map>
#include <vector>

using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n = 0;
    cin >> n;

    vector<int> a(n);
    for (int i = 0; i < n; ++i) {
        cin >> a[i];
    }

    vector<int> sorted_a = a;
    sort(sorted_a.begin(), sorted_a.end());

    unordered_map<int, int> diff;
    diff.reserve(2 * n + 7);
    int non_zero_keys = 0;

    auto add_delta = [&](const int key, const int delta) {
        const int previous = diff[key];
        const int current = previous + delta;
        if (previous == 0 && current != 0) {
            ++non_zero_keys;
        } else if (previous != 0 && current == 0) {
            --non_zero_keys;
        }
        if (current == 0) {
            diff.erase(key);
        } else {
            diff[key] = current;
        }
    };

    int answer = 0;
    for (int i = 0; i < n; ++i) {
        add_delta(a[i], +1);
        add_delta(sorted_a[i], -1);
        if (non_zero_keys == 0) {
            ++answer;
        }
    }

    cout << answer << '\n';
    return 0;
}
